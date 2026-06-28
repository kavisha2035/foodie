const express = require('express');
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate } = require('../validators/auth.validator');
const { placeOrderSchema, updateOrderStatusSchema } = require('../validators/food.validator');

const router = express.Router();

/* POST /api/orders — place order (user) */
router.post('/',
    authMiddleware.authUserMiddleware,
    validate(placeOrderSchema),
    orderController.placeOrder);

/* GET /api/orders — get user's orders */
router.get('/',
    authMiddleware.authUserMiddleware,
    orderController.getUserOrders);

/* GET /api/orders/:id — get single order */
router.get('/:id',
    authMiddleware.authUserMiddleware,
    orderController.getOrderById);

/* PATCH /api/orders/:id/status — food partner updates order status */
router.patch('/:id/status',
    authMiddleware.authFoodPartnerMiddleware,
    validate(updateOrderStatusSchema),
    orderController.updateOrderStatus);

module.exports = router;
