const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'food',
        required: true
    },
    action: {
        type: String,
        enum: ['watch', 'like', 'save', 'share', 'skip', 'order'],
        required: true
    },
    watchPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for fast lookups of user+food+action combos
interactionSchema.index({ userId: 1, foodId: 1, action: 1 });
// Index for aggregation queries (feed ranking, stats)
interactionSchema.index({ foodId: 1, createdAt: -1 });
interactionSchema.index({ userId: 1, createdAt: -1 });

const Interaction = mongoose.model('interaction', interactionSchema);

module.exports = Interaction;
