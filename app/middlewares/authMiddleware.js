import jwt from "jsonwebtoken";
import userModel from "../core/models/userModel.js";

export const isAuthenticated = async(req, res, next)=>{
    try {
        const accessToken = req.cookies.accessToken;
        if(!accessToken){
            return res.status(401).json({message:"Unauthorized. Please login."});
        }
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await userModel.findById(decoded.id).select("-password");
        if(!user){
            return res.status(401).json({message:"No user found. Please login."});
        }
        req.user;
        next();
    } catch (error) {
        console.log("Error encountered during authentication: ", error);
        return res.status(500).json({message:"Something went wrong. Please try again later."});
    }
}


export const isAdmin = async(req, res, next)=>{
    if(req.user && req.user.role === "admin"){
        next();
    }else{
        return res.status(401).json({message:"Access denied. Please login as admin."});
    }
}