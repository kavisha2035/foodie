const userModel = require("../models/user.model");
const foodPartnerModel = require("../models/foodpartner.model");
const RefreshToken = require("../models/refreshToken.model");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generates an access token (short-lived, 15 min)
 */
function generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY
    });
}

/**
 * Generates a refresh token (random string) and stores it in the DB
 */
async function generateRefreshToken(userId, userType) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        token,
        userId,
        userType,
        expiresAt
    });

    return { token, expiresAt };
}

/**
 * Sets access + refresh token cookies on the response
 */
function setTokenCookies(res, accessToken, refreshToken, refreshExpiresAt) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000 // 7 days
    });
}

// ─── USER AUTH ───────────────────────────────────────────────────────────────

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        const accessToken = generateAccessToken(user._id);
        const { token: refreshToken, expiresAt } = await generateRefreshToken(user._id, 'user');
        setTokenCookies(res, accessToken, refreshToken, expiresAt);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(user._id);
        const { token: refreshToken, expiresAt } = await generateRefreshToken(user._id, 'user');
        setTokenCookies(res, accessToken, refreshToken, expiresAt);

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

function logoutUser(req, res) {
    try {
        // Invalidate refresh token from DB if present
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function refreshUserToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        const storedToken = await RefreshToken.findOne({
            token: refreshToken,
            userType: 'user'
        });

        if (!storedToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (storedToken.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({ message: "Refresh token expired" });
        }

        // Verify user still exists
        const user = await userModel.findById(storedToken.userId);
        if (!user) {
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({ message: "User not found" });
        }

        // Rotate: delete old, issue new refresh token
        await RefreshToken.deleteOne({ _id: storedToken._id });
        const accessToken = generateAccessToken(user._id);
        const { token: newRefreshToken, expiresAt } = await generateRefreshToken(user._id, 'user');
        setTokenCookies(res, accessToken, newRefreshToken, expiresAt);

        res.status(200).json({
            message: "Token refreshed successfully",
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

// ─── FOOD PARTNER AUTH ──────────────────────────────────────────────────────

async function registerFoodPartner(req, res) {
    try {
        const { name, email, password, phone, address, contactName } = req.body;

        const isAccountAlreadyExists = await foodPartnerModel.findOne({ email });

        if (isAccountAlreadyExists) {
            return res.status(400).json({
                message: "Food partner account already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const foodPartner = await foodPartnerModel.create({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            contactName
        });

        const accessToken = generateAccessToken(foodPartner._id);
        const { token: refreshToken, expiresAt } = await generateRefreshToken(foodPartner._id, 'foodpartner');
        setTokenCookies(res, accessToken, refreshToken, expiresAt);

        res.status(201).json({
            message: "Food partner registered successfully",
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name,
                address: foodPartner.address,
                contactName: foodPartner.contactName,
                phone: foodPartner.phone
            }
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function loginFoodPartner(req, res) {
    try {
        const { email, password } = req.body;

        const foodPartner = await foodPartnerModel.findOne({ email });

        if (!foodPartner) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, foodPartner.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const accessToken = generateAccessToken(foodPartner._id);
        const { token: refreshToken, expiresAt } = await generateRefreshToken(foodPartner._id, 'foodpartner');
        setTokenCookies(res, accessToken, refreshToken, expiresAt);

        res.status(200).json({
            message: "Food partner logged in successfully",
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

function logoutFoodPartner(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            message: "Food partner logged out successfully"
        });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

async function refreshFoodPartnerToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not found" });
        }

        const storedToken = await RefreshToken.findOne({
            token: refreshToken,
            userType: 'foodpartner'
        });

        if (!storedToken) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (storedToken.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({ message: "Refresh token expired" });
        }

        const foodPartner = await foodPartnerModel.findById(storedToken.userId);
        if (!foodPartner) {
            await RefreshToken.deleteOne({ _id: storedToken._id });
            return res.status(401).json({ message: "Food partner not found" });
        }

        // Rotate: delete old, issue new
        await RefreshToken.deleteOne({ _id: storedToken._id });
        const accessToken = generateAccessToken(foodPartner._id);
        const { token: newRefreshToken, expiresAt } = await generateRefreshToken(foodPartner._id, 'foodpartner');
        setTokenCookies(res, accessToken, newRefreshToken, expiresAt);

        res.status(200).json({
            message: "Token refreshed successfully",
            foodPartner: {
                _id: foodPartner._id,
                email: foodPartner.email,
                name: foodPartner.name
            }
        });
    } catch (error) {
        console.error("Refresh Token Error:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner,
    refreshFoodPartnerToken
};