import { redis } from "../core/database/redisConnection.js";
import userModel from "../core/models/userModel.js";
import jwt from "jsonwebtoken";

const generateTokens = (id)=>{
    const accessToken = jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"});
    const refreshToken = jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "7d"});
    return {accessToken, refreshToken};
}

const storeRefreshToken = async(id, refreshToken)=>{
    const foundUser = await userModel.findById(id);
    if(!foundUser){
        return;
    }
    await redis.set(`refreshToken:${foundUser._id}`, refreshToken, "EX", 60 * 60 * 24 * 7); // 7days expiration
}

const setCookies = (res, accessToken, refreshToken)=>{
    res.cookie("accessToken", accessToken, {
        httpOnly: true, //to prevent XSS attack
        secure: process.env.NODE_ENV === "production", //for https only. ie in prod environment
        sameSite: "strict", //for csrf protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours or 1day (in milliseconds)
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days validity
    });
}
export const signup = async(req,res)=>{
    
    try {
        const {name, email, phone, password} = req.body;
        //check user exist already
        const foundUser = await userModel.findOne({email});
        if(foundUser){
            return res.status(400).json({message:" User already exist"});
        }
        const user  = await userModel.create({name, email, phone, password});

        //authenticate user with tokens
        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);
        return res.status(201).json({
            message:"User registered successfully", 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log("Errors encountered during registration: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}
export const login = async(req,res)=>{
    try {
        const {email, password} = req.body;
        const foundUser = await userModel.findOne({email});
        if(!foundUser){
            return res.status(401).json({message:"Invalid credentials"});
        }
        if(foundUser.comparePassword(password)){
            const {accessToken, refreshToken} = generateTokens(foundUser._id);
            await storeRefreshToken(foundUser._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
            return res.status(200).json({
                message:"User logged in successfully", 
                user: {
                    _id: foundUser._id,
                    name: foundUser.name,
                    email: foundUser.email,
                    role: foundUser.role
                }
            });
        }else{
            return res.status(401).json({message:"Invalid credentials"});
        }
    } catch (error) {
        console.log("Errors encountered during login: ", error);
        return res.status(500).json({message:"Something went wrong. Please try again later."});
    }
}
export const logout = async(req,res)=>{
    try {
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            //decode the refresh token
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken:${decoded.id}`);
        }
        //clear access token in cookies
        res.clearCookie("accessToken");
        //clear refresh token in cookies
        res.clearCookie("refreshToken");
        return res.status(204).json({message:"Logged out successfully"});
    } catch (error) {
        res.status(500).json({message:"Something went wrong. Please try again later."});
        console.log("Errors encountered during logout: ", error);
    }
}

export const refreshToken= async(req,res)=>{
    try{
        //get the refresh token from cookies
        const refreshToken = req.cookies.refreshToken;
        //if no refresh token found, return unauthorized
        if(!refreshToken){
            return res.status(401).json({message:"Unauthorized. Please login."});
        }
        //verify the refresh token if it exist
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        //check the refresh token in redis
        const storedToken = await redis.get(`refreshToken:${decoded.id}`);
        if(storedToken !== refreshToken){
            return res.status(401).json({message:"Unauthorized. Please login."});
        }
        
        //generate new access token
        const newAccessToken = jwt.sign({id:decoded.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "1d"});
        //send the access token 
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", //for https only. ie in prod environment
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours or 1day in milliseconds
        });
        return res.status(200).json({message:"Token refreshed successfully"});
    }catch(error){
        console.log("Errors encountered during token refresh: ", error);
        return res.status(500).json({message:"Something went wrong. Please try again later."});
    }
}

export const getProfile = async(req,res)=>{
    try {
        const {user} = req;
        return res.status(200).json({user});
    } catch (error) {
        console.log("Errors encountered during get profile: ", error);
        return res.status(500).json({message:"Something went wrong. Please try again later."});
    }
}