const Order = require('../models/order.model');
const foodModel = require('../models/food.model');
const Interaction = require('../models/interaction.model');

async function placeOrder(req, res) {
    try {
        const { foodId, amount } = req.body;
        const userId = req.user._id;

        // Verify food exists and is available
        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({ message: "Food item not found" });
        }
        if (!food.isAvailable) {
            return res.status(400).json({ message: "This food item is currently unavailable" });
        }

        const order = await Order.create({
            userId,
            foodId: food._id,
            foodPartnerId: food.foodPartner,
            amount
        });

        // Log an 'order' interaction for feed ranking
        await Interaction.create({
            userId,
            foodId: food._id,
            action: 'order',
            watchPercentage: 100
        });

        const populatedOrder = await Order.findById(order._id)
            .populate('foodId', 'name video price')
            .populate('foodPartnerId', 'name address');

        res.status(201).json({
            message: "Order placed successfully",
            order: populatedOrder
        });
    } catch (error) {
        console.error("Place Order Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getUserOrders(req, res) {
    try {
        const userId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { userId };
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
            message: "Orders fetched successfully",
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

async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('foodId', 'name video price description')
            .populate('foodPartnerId', 'name address phone contactName');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify user owns this order
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You can only view your own orders" });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });
    } catch (error) {
        console.error("Get Order By ID Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Verify food partner owns this order
        if (order.foodPartnerId.toString() !== req.foodPartner._id.toString()) {
            return res.status(403).json({ message: "You can only update your own orders" });
        }

        // Validate status transitions
        const validTransitions = {
            'placed': ['confirmed', 'cancelled'],
            'confirmed': ['preparing', 'cancelled'],
            'preparing': ['delivered', 'cancelled'],
            'delivered': [],
            'cancelled': []
        };

        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from '${order.status}' to '${status}'`,
                validTransitions: validTransitions[order.status]
            });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function getFoodPartnerOrders(req, res) {
    try {
        const foodPartnerId = req.foodPartner._id;
        const { status, page = 1, limit = 10 } = req.query;

        const filter = { foodPartnerId };
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('foodId', 'name video price')
            .populate('userId', 'fullName email');

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            message: "Orders fetched successfully",
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Get Food Partner Orders Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    placeOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getFoodPartnerOrders
};
