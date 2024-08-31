import express from "express";
import { login, signup, logout, refreshToken, getProfile } from "../controllers/authController.js"; 

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
// router.get('/profile', getProfile);

export default router;