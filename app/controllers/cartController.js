import productModel from "../core/models/productModel";

export const getCartProducts = async (req, res) => {
    try {
        //get products from database where _id == req.user.cartItems since we store products's id and quantity in the req.user.cartItems
        const productsInCart = await productModel.find({_id: {$in: req.user.cartItems}});
        /** for each productId found in the database, get the quantity from the req.user.cartItems and 
         * return an object with the product and quantity*/
        const cartItems= products.map((product)=>{
            const item  = req.user.cartItems.find((item) => item.id === product.id);
            return {...product.toJSON(), quantity:item.quantity}
        })

        return res.status(200).json(cartItems);
    } catch (error) {
        
    }
}
export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item=> item.id ===productId);
        if(existingItem){
            existingItem.quantity += 1;
        }else{
           user.cartItems.push(productId); 
        }
        await user.save();
        return res.status(200).json(user.cartItems);
    } catch (error) {
        console.log('Error encountered when adding to cart: ', error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const deleteFromCart = async (req, res) => {
    // const {productId} = req.params;
    try {
        const {productId} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item=> item.id ===productId);
        if(existingItem){
            //return items that are not having the same id as the productId received in the request
            user.cartItems = user.cartItems.filter((item)=> item.id !== productId);
        }else{
            //return the item does not exist in cart anymore
            return res.status(404).json({message: "Item does not exist in cart."});
        }
        await user.save();
        return res.status(200).json(user.cartItems);
    } catch (error) {
        console.log('Error encountered when adding to cart: ', error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const emptyCart = async (req, res) => {
    try {
        const user = req.user;
        user.cartItems = [];
        await user.save();
        return res.status(200).json({message: "Cart emptied successfully."}, user.cartItems);
    }catch(error) { 
        console.log('Error encountered when emptying to cart: ', error);
        return res.status(500).json({message: "Something went wrong. Please try again later."});
    }
}

export const updateCartQuantity = async (req, res) => {
    try {
        const {id: productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingItem = user.cartItems.find(item=> item.id ===productId);
        if(existingItem){
            //if item exist in users cart items list
            if(quantity > 0){
                existingItem.quantity = quantity;
            }else{
                //remove item from cart if quantity is 0
                user.cartItems = user.cartItems.filter((item)=> item.id !== productId);
                return res.status(400).json({message: "Invalid quantity. Quantity should be greater than 0."});
            }
        }else{
            console.log("Item does not exist in cart.");
            return res.status(404).json({message: "Item does not exist in cart."});
        }
        await user.save();
        return res.status(200).json(user.cartItems);
    } catch (error) {
       console.log("Error encountered when updating cart quantity: ", error);
       return res.status(500).json({message: "Something went wrong. Please try again later."}); 
    }
}