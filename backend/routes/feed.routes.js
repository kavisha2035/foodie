const express = require('express');
const feedController = require('../controllers/feed.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { cacheFeed, cacheTrending } = require('../middlewares/cache.middleware');

const router = express.Router();

/* GET /api/feed — ranked personalized feed (cached 5 min per user) */
router.get('/',
    authMiddleware.authUserMiddleware,
    cacheFeed,
    feedController.getFeed);

/* GET /api/feed/stories — mood-based story groups */
router.get('/stories',
    authMiddleware.authUserMiddleware,
    feedController.getStories);

/* GET /api/feed/trending — trending reels by city (cached 15 min per city) */
router.get('/trending',
    authMiddleware.authUserMiddleware,
    cacheTrending,
    feedController.getTrending);

module.exports = router;
