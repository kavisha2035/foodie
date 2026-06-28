const { getCache, setCache, deleteCache } = require('../services/cache.service');

/**
 * Express middleware factory that caches API responses in Redis.
 *
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @param {function} keyGenerator - Function that takes (req) and returns a cache key string
 */
function cacheMiddleware(ttlSeconds, keyGenerator) {
    return async (req, res, next) => {
        try {
            const cacheKey = keyGenerator(req);
            const cachedData = await getCache(cacheKey);

            if (cachedData) {
                return res.status(200).json({
                    ...cachedData,
                    _cached: true
                });
            }

            // Override res.json to intercept the response and cache it
            const originalJson = res.json.bind(res);
            res.json = (data) => {
                // Only cache successful responses
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    setCache(cacheKey, data, ttlSeconds).catch(() => {});
                }
                return originalJson(data);
            };

            next();
        } catch (err) {
            // If caching fails, just continue without cache
            console.warn('Cache middleware error:', err.message);
            next();
        }
    };
}

// ─── Pre-configured cache middlewares ────────────────────────────────────────

/**
 * Cache feed results per user — 5 min TTL
 */
const cacheFeed = cacheMiddleware(5 * 60, (req) => {
    const userId = req.user?._id?.toString() || 'anon';
    const mood = req.query.mood || 'all';
    const cursor = req.query.cursor || 'start';
    return `feed:${userId}:${mood}:${cursor}`;
});

/**
 * Cache trending feed per city — 15 min TTL
 */
const cacheTrending = cacheMiddleware(15 * 60, (req) => {
    const city = req.query.city || 'all';
    const hours = req.query.hours || '24';
    return `trending:${city}:${hours}`;
});

/**
 * Cache food partner profile — 10 min TTL
 */
const cacheFoodPartnerProfile = cacheMiddleware(10 * 60, (req) => {
    return `foodpartner:${req.params.id}`;
});

module.exports = {
    cacheMiddleware,
    cacheFeed,
    cacheTrending,
    cacheFoodPartnerProfile
};
