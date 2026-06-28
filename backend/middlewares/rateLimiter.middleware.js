const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * Global rate limit: 100 requests / 15 min per IP
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests, please try again later",
        retryAfter: "15 minutes"
    }
});

/**
 * Auth routes: 10 requests / 15 min per IP (brute force prevention)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts, please try again later",
        retryAfter: "15 minutes"
    }
});

/**
 * Feed route: 60 requests / min per user
 */
const feedLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?._id?.toString() || ipKeyGenerator(req);
    },
    message: {
        message: "Too many feed requests, please slow down",
        retryAfter: "1 minute"
    }
});

/**
 * Upload route: 5 uploads / hour per food partner
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.foodPartner?._id?.toString() || ipKeyGenerator(req);
    },
    message: {
        message: "Upload limit reached. You can upload up to 5 reels per hour",
        retryAfter: "1 hour"
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    feedLimiter,
    uploadLimiter
};
