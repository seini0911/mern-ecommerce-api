
import { redis } from "../core/database/redisConnection.js";
import cloudinary from "../core/lib/cloudinary.js";
import productModel from "../core/models/productModel.js";


export const createProduct = async(req, res) => {
    try {
        const {name, description, price, image, category} = req.body;
        let cloudinaryResponse = null;
        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });
        }

        const product = await productModel.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ?? "",
            category,
        })

        res.status(201).json(product);

    } catch (error) {
        console.log("Error encountered when creating a new product: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const deleteProduct = async(req, res) => {
    try {
        const product =await productModel.findById(req.params.id);
        if(!product){
            return res.status(404).json({message: "Product not found."});
        }

        if(product.image){
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                //delete image from cloudinary
                await cloudinary.uploader.destroy(`products/${publicId}`);
            } catch (error) {
                console.log("Error encountered when deleting image from cloudinary: ", error);
            }
        }
        //delete product from database
        await productModel.findByIdAndDelete(req.params.id);
        return res.status(200).json({message: "Product deleted successfully."});
    } catch (error) {
        console.log("Error encountered when deleting a product: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await productModel.find({}); //find all products
        return res.status(200).json(products);
    } catch (error) {
        console.log("Errors encountered during products retrieval: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const getFeaturedProducts = async(req, res) => {
    try {
        //get featured products cached in redis for fast access
        var featuredProducts = await redis.get("featuredProducts");
        if(featuredProducts){
            return res.status(200).json(JSON.parse(featuredProducts));
        }
        //if no featured products in redis, get them from database
        const products = await productModel.find({isFeatured: true}).lean(); //to get plain javascript object instead of mongodb documents to improve performance
        
        if(!products){
            return res.status(404).json({message: "No featured products found."});
        }

        //cache the featured products in redis for later use
        await redis.set("featuredProducts", JSON.stringify(products));
        return res.status(200).json(products);
    } catch (error) {
        console.log("Error encountered when getting Featured Products: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}


export const getRecommendedProducts = async(req, res) => {
    try {
        const products = await productModel.aggregate([
            {
                $sample: {
                    size: 4
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                    category: 1,
                }
            }
        ]);
        return res.status(200).json(products);
    }catch (error) {
        console.log("Error encountered when getting Recommended Products: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}


export const getProductByCategory = async(req, res)=>{
    //get category from request params
    const {category} = req.params;
    try {
        const product = await productModel.find({category});
        return res.status(200).json(product);
    } catch (error) {
        console.log("Error encountered when getting product by category: ", error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}


export const makeProductFeatured = async(req, res)=>{
    try {
        const product = await productModel.findById(req.params.id);
        if(!product){
            return res.status(404).json({message: "Product not found."});
        }
        //change the featured status of the product
        product.isFeatured = !product.isFeatured;
        //update product in database
        const updatedProduct = await product.save();
        //update featured products cache in redis
        await updateFeaturedProductCache();
        return res.status(200).json(updatedProduct);

    } catch (error) {
        console.log('Error encountered when making product featured: ', error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

async function updateFeaturedProductCache(product) {
    try {
        const featuredProducts = await productModel.find({isFeatured: true}).lean();
        await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    } catch (error) {
        console.log('Error encountered when updating featured products cache: ', error);
    }
}