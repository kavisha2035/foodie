const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId)
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId })

    if (!foodPartner) {
        return res.status(404).json({ message: "Food partner not found" });
    }

    res.status(200).json({
        message: "Food partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner
        }

    });
}

async function getPartnerReels(req, res) {
    try {
        const partnerId = req.foodPartner._id;
        const reels = await foodModel.find({ foodPartner: partnerId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: "Partner reels fetched successfully",
            foodItems: reels
        });
    } catch (error) {
        console.error("Get Partner Reels Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    getFoodPartnerById,
    getPartnerReels
};