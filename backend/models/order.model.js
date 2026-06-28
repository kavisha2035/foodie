const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    foodPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'preparing', 'delivered', 'cancelled'],
        default: 'placed'
    }
}, {
    timestamps: true
});

// Indexes for common queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ foodPartnerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('order', orderSchema);

module.exports = Order;
