import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { addToCart, deleteFromCart, emptyCart, getCartProducts, updateCartQuantity } from "../controllers/cartController";
const router = express.Router();


router.post('/', isAuthenticated, addToCart);
router.get('/', isAuthenticated, getCartProducts);
router.delete('/', isAuthenticated, deleteFromCart);
router.delete('/', isAuthenticated, emptyCart);
router.put('/:id', isAuthenticated, updateCartQuantity);

export default router;