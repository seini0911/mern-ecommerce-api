import mongoose from "mongoose";

export const databaseConnection = async()=>{
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Successfully Connected to the database");
    } catch (error) {
        console.log("error encountered during connection to the database :", error);
    }
}