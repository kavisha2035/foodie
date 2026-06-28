const express = require('express');
const foodPartnerController = require("../controllers/food-partner.controller");
const orderController = require("../controllers/order.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { cacheFoodPartnerProfile } = require("../middlewares/cache.middleware");

const router = express.Router();

/* GET /api/food-partner/orders — food partner sees incoming orders */
router.get("/orders",
    authMiddleware.authFoodPartnerMiddleware,
    orderController.getFoodPartnerOrders);

/* GET /api/food-partner/:id — get food partner profile (user, cached 10 min) */
router.get("/:id",
    authMiddleware.authUserMiddleware,
    cacheFoodPartnerProfile,
    foodPartnerController.getFoodPartnerById);

module.exports = router;