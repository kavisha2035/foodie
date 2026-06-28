const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
});

const router = express.Router();

/* GET /api/user/me — get logged-in user's profile */
router.get('/me',
    authMiddleware.authUserMiddleware,
    userController.getProfile);

/* PATCH /api/user/me — update profile (name, picture) */
router.patch('/me',
    authMiddleware.authUserMiddleware,
    upload.single('profilePicture'),
    userController.updateProfile);

/* GET /api/user/me/orders — user's order history */
router.get('/me/orders',
    authMiddleware.authUserMiddleware,
    userController.getUserOrders);

/* GET /api/user/me/liked — all reels user has liked */
router.get('/me/liked',
    authMiddleware.authUserMiddleware,
    userController.getLikedReels);

module.exports = router;
