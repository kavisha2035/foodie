const foodPartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authFoodPartnerMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Access token not found" });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const foodPartner = await foodPartnerModel.findById(decodedToken.id);
        if (!foodPartner) {
            return res.status(401).json({ message: "Unauthorized: Food partner not found" });
        }

        req.foodPartner = foodPartner;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid access token" });
        }
        console.error("Authentication Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function authUserMiddleware(req, res, next) {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            return res.status(401).json({ message: "Access token not found" });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decodedToken.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid access token" });
        }
        console.error("Authentication Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}


module.exports = { authFoodPartnerMiddleware, authUserMiddleware };
