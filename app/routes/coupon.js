import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { getCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.get('/', isAuthenticated, getCoupon);
router.get('/validate', isAuthenticated, validateCoupon);

export default router;