const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model");
const saveModel = require("../models/save.model");
const { v4: uuid } = require("uuid");


async function createFood(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description || '',
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id,
            moodTags: req.body.moodTags ? JSON.parse(req.body.moodTags) : [],
            cuisineTags: req.body.cuisineTags ? JSON.parse(req.body.cuisineTags) : [],
            price: parseFloat(req.body.price),
            city: req.body.city
        });

        res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.error("Create Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getFoodItems(req, res) {
    try {
        const foodItems = await foodModel.find({ isAvailable: true })
            .populate('foodPartner', 'name address city')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems
        });
    } catch (error) {
        console.error("Get Food Items Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getFoodById(req, res) {
    try {
        const food = await foodModel.findById(req.params.id)
            .populate('foodPartner', 'name address contactName phone city');

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Check if the requesting user has liked/saved this item
        let isLiked = false;
        let isSaved = false;
        if (req.user) {
            const like = await likeModel.findOne({ user: req.user._id, food: food._id });
            const save = await saveModel.findOne({ user: req.user._id, food: food._id });
            isLiked = !!like;
            isSaved = !!save;
        }

        res.status(200).json({
            message: "Food item fetched successfully",
            food: {
                ...food.toObject(),
                isLiked,
                isSaved
            }
        });
    } catch (error) {
        console.error("Get Food By ID Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function updateFood(req, res) {
    try {
        const food = await foodModel.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Verify ownership
        if (food.foodPartner.toString() !== req.foodPartner._id.toString()) {
            return res.status(403).json({ message: "You can only edit your own food items" });
        }

        const allowedUpdates = ['name', 'description', 'moodTags', 'cuisineTags', 'price', 'isAvailable', 'city'];
        const updates = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Food item updated successfully",
            food: updatedFood
        });
    } catch (error) {
        console.error("Update Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function deleteFood(req, res) {
    try {
        const food = await foodModel.findById(req.params.id);

        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Verify ownership
        if (food.foodPartner.toString() !== req.foodPartner._id.toString()) {
            return res.status(403).json({ message: "You can only delete your own food items" });
        }

        await foodModel.findByIdAndDelete(req.params.id);

        // Clean up related likes and saves
        await likeModel.deleteMany({ food: req.params.id });
        await saveModel.deleteMany({ food: req.params.id });

        res.status(200).json({
            message: "Food item deleted successfully"
        });
    } catch (error) {
        console.error("Delete Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function searchFood(req, res) {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.status(400).json({ message: "Search query 'q' is required" });
        }

        const foodItems = await foodModel.find(
            {
                $text: { $search: q },
                isAvailable: true
            },
            { score: { $meta: "textScore" } }
        )
            .sort({ score: { $meta: "textScore" } })
            .limit(20)
            .populate('foodPartner', 'name address city');

        res.status(200).json({
            message: "Search results",
            foodItems
        });
    } catch (error) {
        console.error("Search Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function filterFood(req, res) {
    try {
        const { mood, cuisine, minPrice, maxPrice, city } = req.query;

        const filter = { isAvailable: true };

        if (mood) {
            filter.moodTags = { $in: mood.split(',') };
        }
        if (cuisine) {
            filter.cuisineTags = { $in: cuisine.split(',') };
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (city) {
            filter.city = { $regex: new RegExp(city, 'i') };
        }

        const foodItems = await foodModel.find(filter)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('foodPartner', 'name address city');

        res.status(200).json({
            message: "Filtered results",
            foodItems
        });
    } catch (error) {
        console.error("Filter Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        const isAlreadyLiked = await likeModel.findOne({
            user: user._id,
            food: foodId
        });

        if (isAlreadyLiked) {
            await likeModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { likeCount: -1 }
            });

            return res.status(200).json({
                message: "Food unliked successfully"
            });
        }

        const like = await likeModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: 1 }
        });

        res.status(201).json({
            message: "Food liked successfully",
            like
        });
    } catch (error) {
        console.error("Like Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        });

        if (isAlreadySaved) {
            await saveModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { savesCount: -1 }
            });

            return res.status(200).json({
                message: "Food unsaved successfully"
            });
        }

        const save = await saveModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: 1 }
        });

        res.status(201).json({
            message: "Food saved successfully",
            save
        });
    } catch (error) {
        console.error("Save Food Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getSaveFood(req, res) {
    try {
        const user = req.user;

        const savedFoods = await saveModel.find({ user: user._id })
            .populate({
                path: 'food',
                populate: { path: 'foodPartner', select: 'name address city' }
            });

        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods
        });
    } catch (error) {
        console.error("Get Saved Foods Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


module.exports = {
    createFood,
    getFoodItems,
    getFoodById,
    updateFood,
    deleteFood,
    searchFood,
    filterFood,
    likeFood,
    saveFood,
    getSaveFood
};