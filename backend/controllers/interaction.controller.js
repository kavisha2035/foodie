const Interaction = require('../models/interaction.model');
const foodModel = require('../models/food.model');
const { deleteCachePattern } = require('../services/cache.service');

async function logInteraction(req, res) {
    try {
        const { action, watchPercentage } = req.body;
        const foodId = req.params.id;
        const userId = req.user._id;

        // Verify food exists
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        const interaction = await Interaction.create({
            userId,
            foodId,
            action,
            watchPercentage: watchPercentage || 0
        });

        // Invalidate user's cached feed so next request gets fresh rankings
        await deleteCachePattern(`feed:${userId}:*`);

        res.status(201).json({
            message: "Interaction logged successfully",
            interaction
        });
    } catch (error) {
        console.error("Log Interaction Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getInteractionStats(req, res) {
    try {
        const foodId = req.params.id;

        // Verify food exists and belongs to this food partner
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        if (food.foodPartner.toString() !== req.foodPartner._id.toString()) {
            return res.status(403).json({ message: "You can only view stats for your own food items" });
        }

        const stats = await Interaction.aggregate([
            { $match: { foodId: food._id } },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    avgWatchPercentage: {
                        $avg: {
                            $cond: [{ $eq: ['$action', 'watch'] }, '$watchPercentage', null]
                        }
                    }
                }
            }
        ]);

        // Reshape into a clean object
        const result = {
            totalWatches: 0,
            avgWatchPercentage: 0,
            likeCount: food.likeCount,
            saveCount: food.savesCount,
            shareCount: 0,
            skipCount: 0,
            orderCount: 0
        };

        for (const stat of stats) {
            switch (stat._id) {
                case 'watch':
                    result.totalWatches = stat.count;
                    result.avgWatchPercentage = Math.round(stat.avgWatchPercentage || 0);
                    break;
                case 'share':
                    result.shareCount = stat.count;
                    break;
                case 'skip':
                    result.skipCount = stat.count;
                    break;
                case 'order':
                    result.orderCount = stat.count;
                    break;
            }
        }

        res.status(200).json({
            message: "Interaction stats fetched successfully",
            foodId,
            stats: result
        });
    } catch (error) {
        console.error("Get Interaction Stats Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    logInteraction,
    getInteractionStats
};
