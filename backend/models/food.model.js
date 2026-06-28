const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    video: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodpartner"
    },
    likeCount: {
        type: Number,
        default: 0
    },
    savesCount: {
        type: Number,
        default: 0
    },
    moodTags: {
        type: [String],
        enum: ['late_night', 'spicy', 'comfort_food', 'healthy', 'sweet', 'rainy_day', 'breakfast', 'quick_bite'],
        default: []
    },
    cuisineTags: {
        type: [String],
        enum: ['north_indian', 'south_indian', 'chinese', 'italian', 'mexican', 'thai', 'continental', 'street_food'],
        default: []
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    city: {
        type: String,
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Text index for search on name + description
foodSchema.index({ name: 'text', description: 'text' });
// Compound index for feed queries
foodSchema.index({ isAvailable: 1, createdAt: -1 });
foodSchema.index({ moodTags: 1, isAvailable: 1 });
foodSchema.index({ cuisineTags: 1, isAvailable: 1 });

const foodModel = mongoose.model("food", foodSchema);

module.exports = foodModel;