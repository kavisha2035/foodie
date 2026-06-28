const userModel = require('../models/user.model');
const likeModel = require('../models/likes.model');
const Order = require('../models/order.model');
const storageService = require('../services/storage.service');
const { v4: uuid } = require('uuid');

async function getProfile(req, res) {
    try {
        const user = req.user;

        res.status(200).json({
            message: "Profile fetched successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
        const updates = {};

        if (req.body.fullName) {
            updates.fullName = req.body.fullName;
        }

        // Handle profile picture upload
        if (req.file) {
            const uploadResult = await storageService.uploadFile(req.file.buffer, `profile_${uuid()}`);
            updates.profilePicture = uploadResult.url;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getUserOrders(req, res) {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { userId: req.user._id };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('foodId', 'name video price')
            .populate('foodPartnerId', 'name address phone');

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            message: "Order history fetched successfully",
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getLikedReels(req, res) {
    try {
        const likes = await likeModel.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate({
                path: 'food',
                populate: { path: 'foodPartner', select: 'name address city' }
            });

        const likedFoods = likes
            .filter(l => l.food) // filter out any deleted food items
            .map(l => l.food);

        res.status(200).json({
            message: "Liked reels fetched successfully",
            likedFoods
        });
    } catch (error) {
        console.error("Get Liked Reels Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getUserOrders,
    getLikedReels
};
