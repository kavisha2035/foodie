const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;
let redisErrorLogged = false;

// In-memory fallback cache
const memoryCache = new Map();

function initRedis() {
    try {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 1,
            lazyConnect: true,
            retryStrategy(times) {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 500, 3000);
            }
        });

        redisClient.on('connect', () => {
            console.log('Cache Service: Redis connected');
            isRedisConnected = true;
            redisErrorLogged = false;
        });

        redisClient.on('error', (err) => {
            if (!redisErrorLogged) {
                console.warn('Cache Service: Redis unavailable, using memory fallback');
                redisErrorLogged = true;
            }
            isRedisConnected = false;
        });

        redisClient.on('close', () => {
            isRedisConnected = false;
        });

        // Attempt connection, but don't block startup if Redis is down
        redisClient.connect().catch(() => {
            if (!redisErrorLogged) {
                console.warn('Cache Service: Redis not available, using memory fallback');
                redisErrorLogged = true;
            }
            isRedisConnected = false;
        });
    } catch (err) {
        console.warn('Cache Service: Redis not available, using memory fallback');
        isRedisConnected = false;
    }
}

// Initialize on module load
initRedis();

/**
 * Get a cached value by key
 */
async function getCache(key) {
    try {
        if (isRedisConnected && redisClient) {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }

        // Memory fallback
        const entry = memoryCache.get(key);
        if (entry && entry.expiresAt > Date.now()) {
            return entry.data;
        }
        if (entry) {
            memoryCache.delete(key); // Expired
        }
        return null;
    } catch (err) {
        console.warn('Cache get error:', err.message);
        return null;
    }
}

/**
 * Set a cached value with TTL in seconds
 */
async function setCache(key, value, ttlSeconds) {
    try {
        if (isRedisConnected && redisClient) {
            await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
            return;
        }

        // Memory fallback
        memoryCache.set(key, {
            data: value,
            expiresAt: Date.now() + ttlSeconds * 1000
        });
    } catch (err) {
        console.warn('Cache set error:', err.message);
    }
}

/**
 * Delete a specific cache key
 */
async function deleteCache(key) {
    try {
        if (isRedisConnected && redisClient) {
            await redisClient.del(key);
            return;
        }

        memoryCache.delete(key);
    } catch (err) {
        console.warn('Cache delete error:', err.message);
    }
}

/**
 * Delete all cache keys matching a pattern (e.g., "feed:user123:*")
 * Only works with Redis. Memory fallback does prefix matching.
 */
async function deleteCachePattern(pattern) {
    try {
        if (isRedisConnected && redisClient) {
            const keys = await redisClient.keys(pattern);
            if (keys.length > 0) {
                await redisClient.del(...keys);
            }
            return;
        }

        // Memory fallback: prefix match
        const prefix = pattern.replace('*', '');
        for (const key of memoryCache.keys()) {
            if (key.startsWith(prefix)) {
                memoryCache.delete(key);
            }
        }
    } catch (err) {
        console.warn('Cache pattern delete error:', err.message);
    }
}

module.exports = {
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern
};
