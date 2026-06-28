// create server
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Routes
const authRoutes = require('../routes/auth.routes');
const foodRoutes = require('../routes/food.routes');
const foodPartnerRoutes = require('../routes/food-partner.routes');
const feedRoutes = require('../routes/feed.routes');
const orderRoutes = require('../routes/order.routes');
const userRoutes = require('../routes/user.routes');

// Middlewares
const { globalLimiter, authLimiter, feedLimiter } = require('../middlewares/rateLimiter.middleware');

const app = express();

// ─── GLOBAL MIDDLEWARE ──────────────────────────────────────────────────────
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Global rate limiter
app.use(globalLimiter);

// ─── ROUTES ─────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.send("FOODIE API is running");
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/feed', feedLimiter, feedRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/user', userRoutes);

module.exports = app;