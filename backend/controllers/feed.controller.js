const foodModel = require('../models/food.model');
const Interaction = require('../models/interaction.model');
const mongoose = require('mongoose');

/**
 * Determines the current mood based on time of day (IST / server time)
 */
function getMoodFromTime() {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 15) return 'quick_bite';
    if (hour >= 15 && hour < 19) return 'comfort_food';
    if (hour >= 19 && hour < 22) return 'comfort_food'; // dinner time
    // 10 PM - 6 AM
    return 'late_night';
}


/**
 * GET /api/feed
 * Ranked feed with cursor-based pagination.
 * Query: ?mood=late_night&limit=10&cursor=<lastDocId>
 *
 * Ranking: recency + (likeCount * 2) + (savesCount * 3) + interaction signals
 * Cold-start: falls back to trending if user has < 5 interactions
 */
async function getFeed(req, res) {
    try {
        const userId = req.user._id;
        const { mood, limit = 10, cursor } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 50);

        // Check if user is new (cold start)
        const userInteractionCount = await Interaction.countDocuments({ userId });
        if (userInteractionCount < 5) {
            const trendingItems = await foodModel.find({ isAvailable: true })
                .sort({ likeCount: -1, savesCount: -1, createdAt: -1 })
                .limit(limitNum)
                .populate('foodPartner', 'name address city');

            return res.status(200).json({
                message: "Cold start feed fetched successfully",
                feed: trendingItems,
                pagination: {
                    nextCursor: null,
                    hasMore: false
                }
            });
        }

        // Build match filter
        const matchFilter = { isAvailable: true };
        if (mood) {
            matchFilter.moodTags = { $in: mood.split(',') };
        }
        if (cursor) {
            matchFilter._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // Get foods the user has already interacted with heavily (to deprioritize)
        const recentInteractions = await Interaction.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('foodId');
        const interactedFoodIds = recentInteractions.map(i => i.foodId);

        const pipeline = [
            { $match: matchFilter },
            {
                $addFields: {
                    // Recency score: newer items get higher scores
                    recencyScore: {
                        $divide: [
                            1,
                            {
                                $add: [
                                    1,
                                    {
                                        $divide: [
                                            { $subtract: [new Date(), '$createdAt'] },
                                            1000 * 60 * 60 // hours
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    // Engagement score
                    engagementScore: {
                        $add: [
                            { $multiply: ['$likeCount', 2] },
                            { $multiply: ['$savesCount', 3] }
                        ]
                    },
                    // Deprioritize already-seen content
                    seenPenalty: {
                        $cond: [
                            { $in: ['$_id', interactedFoodIds] },
                            -10,
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    rankScore: {
                        $add: [
                            { $multiply: ['$recencyScore', 100] },
                            '$engagementScore',
                            '$seenPenalty'
                        ]
                    }
                }
            },
            { $sort: { rankScore: -1, _id: -1 } },
            { $limit: limitNum },
            {
                $lookup: {
                    from: 'foodpartners',
                    localField: 'foodPartner',
                    foreignField: '_id',
                    as: 'foodPartnerInfo'
                }
            },
            { $unwind: { path: '$foodPartnerInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1,
                    video: 1,
                    description: 1,
                    likeCount: 1,
                    savesCount: 1,
                    moodTags: 1,
                    cuisineTags: 1,
                    price: 1,
                    city: 1,
                    createdAt: 1,
                    rankScore: 1,
                    'foodPartnerInfo.name': 1,
                    'foodPartnerInfo.address': 1,
                    'foodPartnerInfo._id': 1
                }
            }
        ];

        const feedItems = await foodModel.aggregate(pipeline);

        const nextCursor = feedItems.length === limitNum
            ? feedItems[feedItems.length - 1]._id
            : null;

        res.status(200).json({
            message: "Feed fetched successfully",
            feed: feedItems,
            pagination: {
                nextCursor,
                hasMore: !!nextCursor
            }
        });
    } catch (error) {
        console.error("Get Feed Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

/**
 * GET /api/feed/stories
 * Returns food items grouped by mood tag.
 * Auto-detects mood from time of day and prioritizes that group.
 */
async function getStories(req, res) {
    try {
        const currentMood = getMoodFromTime();

        const allMoods = ['late_night', 'spicy', 'comfort_food', 'healthy', 'sweet', 'rainy_day', 'breakfast', 'quick_bite'];

        // Prioritize current mood first
        const orderedMoods = [
            currentMood,
            ...allMoods.filter(m => m !== currentMood)
        ];

        const storyGroups = [];

        for (const mood of orderedMoods) {
            const items = await foodModel.find({
                moodTags: mood,
                isAvailable: true
            })
                .sort({ likeCount: -1, createdAt: -1 })
                .limit(5)
                .populate('foodPartner', 'name')
                .select('name video description likeCount savesCount price city moodTags');

            if (items.length > 0) {
                storyGroups.push({
                    mood,
                    isCurrentMood: mood === currentMood,
                    items
                });
            }
        }

        res.status(200).json({
            message: "Stories fetched successfully",
            currentMood,
            serverTime: new Date().toISOString(),
            stories: storyGroups
        });
    } catch (error) {
        console.error("Get Stories Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

/**
 * GET /api/feed/trending
 * Top reels by city/overall in the last 24 hours.
 * Query: ?city=mumbai&hours=24
 * Used as cold-start fallback for new users.
 */
async function getTrending(req, res) {
    try {
        const { city, hours = 24 } = req.query;
        const hoursNum = parseInt(hours) || 24;
        const since = new Date(Date.now() - hoursNum * 60 * 60 * 1000);

        const matchFilter = {
            isAvailable: true,
            createdAt: { $gte: since }
        };

        if (city) {
            matchFilter.city = { $regex: new RegExp(city, 'i') };
        }

        // Get trending by aggregating interactions in the time window
        const trendingFoodIds = await Interaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: since }
                }
            },
            {
                $group: {
                    _id: '$foodId',
                    interactionCount: { $sum: 1 },
                    avgWatch: { $avg: '$watchPercentage' }
                }
            },
            { $sort: { interactionCount: -1 } },
            { $limit: 20 }
        ]);

        const foodIds = trendingFoodIds.map(t => t._id);

        // If we have interaction data, use it; otherwise fall back to likes/saves
        let trendingItems;
        if (foodIds.length > 0) {
            trendingItems = await foodModel.find({
                _id: { $in: foodIds },
                isAvailable: true,
                ...(city ? { city: { $regex: new RegExp(city, 'i') } } : {})
            })
                .populate('foodPartner', 'name address city')
                .select('name video description likeCount savesCount moodTags cuisineTags price city createdAt');

            // Sort by interaction count
            const interactionMap = new Map(trendingFoodIds.map(t => [t._id.toString(), t.interactionCount]));
            trendingItems.sort((a, b) => {
                return (interactionMap.get(b._id.toString()) || 0) - (interactionMap.get(a._id.toString()) || 0);
            });
        } else {
            // Fallback: sort by likeCount + savesCount
            trendingItems = await foodModel.find(matchFilter)
                .sort({ likeCount: -1, savesCount: -1, createdAt: -1 })
                .limit(20)
                .populate('foodPartner', 'name address city')
                .select('name video description likeCount savesCount moodTags cuisineTags price city createdAt');
        }

        res.status(200).json({
            message: "Trending feed fetched successfully",
            timeWindow: `${hoursNum} hours`,
            ...(city && { city }),
            trending: trendingItems
        });
    } catch (error) {
        console.error("Get Trending Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getFeed,
    getStories,
    getTrending
};
