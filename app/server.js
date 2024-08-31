import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import couponRoutes from "./routes/coupon.js";
import { databaseConnection } from "./core/database/databaseConnection.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json()); //to parse the requests' body

app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.listen(PORT, ()=>{
    databaseConnection();
    console.log(`Server is running on http://localhost:${PORT}`);
});