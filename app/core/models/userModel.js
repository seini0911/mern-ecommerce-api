import mongoose from "mongoose";
import bcrypt from "bcryptjs";
var Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    email:{
        type: String,
        required: [true, "email is required"],
        lowercase: true,
        trim: true,
        unique: true,
    },
    phone:{
        type: String,
        required: [true, "Phone number is required"],
        minlength: [8,"Phone number should have atleast 8 characters"]
    },
    password:{
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password should be atleast 8 characters"]
    },
    cartItems: [
        {
            quantity:{
                type: Number,
                default: 1,

            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],
    role:{
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    }
}, {
    timestamps: true
});

//hash user password before saving in db
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        console.log("Internal server error occured : ", error);
        next(error);
    }
});

//compare users password with incoming request password
userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password, this.password);
}

// Compile model from schema
const  userModel = mongoose.model('User', userSchema );
export default userModel;