const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controllers');
const { validate, registerUserSchema, registerFoodPartnerSchema, loginSchema } = require('../validators/auth.validator');

// ─── USER ROUTES ────────────────────────────────────────────────────────────
router.post('/register', validate(registerUserSchema), authController.registerUser);
router.post('/login', validate(loginSchema), authController.loginUser);
router.get('/logout', authController.logoutUser);
router.post('/refresh', authController.refreshUserToken);

// ─── FOOD PARTNER ROUTES ────────────────────────────────────────────────────
router.post('/food-partner/register', validate(registerFoodPartnerSchema), authController.registerFoodPartner);
router.post('/food-partner/login', validate(loginSchema), authController.loginFoodPartner);
router.get('/food-partner/logout', authController.logoutFoodPartner);
router.post('/food-partner/refresh', authController.refreshFoodPartnerToken);

module.exports = router;