import couponModel from "../core/models/couponModel";

export const getCoupon = async(req,res)=>{
    try {
        const coupon = await couponModel.findOne({userId: req.user._id, isActive:true});
        res.status(200).json(coupon);
    } catch (error) {
        console.log("Error getting coupon")
    }
}
export const validateCoupon = async(req,res)=>{
    try {
       const {code} = req.body;
       const coupon = await couponModel.findOne({code: code, userId: req.user._id, isActive:true});
       if(!coupon){
        return res.status(400).json({message: "Invalid coupon code."});
       }
       //if coupon is expired
       if(coupon.expirationDate< new Date()){
        coupon.isActive = false;
        await coupon.save();
        return res.status(404).json({message: "Coupon is expired"})
       }

       res.status(200).json({
        message: "coupon is valid",
        code: coupon.code,
        discount: coupon.discountPercentage,
        expires: coupon.expirationDate
       })
    } catch (error) {
        console.log("Error getting coupon")
    }
}