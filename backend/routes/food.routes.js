const express = require('express');
const foodController = require("../controllers/food.controller");
const interactionController = require("../controllers/interaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../validators/auth.validator");
const { interactSchema } = require("../validators/food.validator");
const { uploadLimiter } = require("../middlewares/rateLimiter.middleware");
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
});


// ─── FOOD PARTNER ROUTES (protected) ────────────────────────────────────────

/* POST /api/food/ — create food reel (rate limited: 5/hr) */
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    uploadLimiter,
    upload.single("video"),
    foodController.createFood);

/* PATCH /api/food/:id — edit food reel metadata */
router.patch('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.updateFood);

/* DELETE /api/food/:id — delete food reel */
router.delete('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteFood);

/* GET /api/food/:id/stats — interaction stats for food partner dashboard */
router.get('/:id/stats',
    authMiddleware.authFoodPartnerMiddleware,
    interactionController.getInteractionStats);


// ─── USER ROUTES (protected) ────────────────────────────────────────────────

/* GET /api/food/ — list all food items */
router.get('/',
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems);

/* GET /api/food/search?q=biryani */
router.get('/search',
    authMiddleware.authUserMiddleware,
    foodController.searchFood);

/* GET /api/food/filter?mood=spicy&cuisine=north_indian */
router.get('/filter',
    authMiddleware.authUserMiddleware,
    foodController.filterFood);

/* GET /api/food/save — get saved foods */
router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood);

/* GET /api/food/:id — single food reel detail */
router.get('/:id',
    authMiddleware.authUserMiddleware,
    foodController.getFoodById);

/* POST /api/food/like — toggle like */
router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood);

/* POST /api/food/save — toggle save */
router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood);

/* POST /api/food/:id/interact — log interaction */
router.post('/:id/interact',
    authMiddleware.authUserMiddleware,
    validate(interactSchema),
    interactionController.logInteraction);


module.exports = router;