import express from "express";
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductByCategory, getRecommendedProducts, makeProductFeatured } from "../controllers/productsController.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";


const router = express.Router();

/** Admin Routes */
router.post("/", isAuthenticated, isAdmin, createProduct);
router.get("/", isAuthenticated, isAdmin, getAllProducts);
router.delete("/:id", isAuthenticated, isAdmin, deleteProduct);
router.patch("/:id", isAuthenticated, isAdmin, makeProductFeatured);

/** Customers Routes */
router.get("/recommended", isAuthenticated, getRecommendedProducts);

/** public Routes */
router.get("/featured", getFeaturedProducts);
router.delete("/category/:category", getProductByCategory);
export default router;