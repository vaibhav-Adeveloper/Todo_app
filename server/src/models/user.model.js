import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    profileImage:{
        type: String,
        default: "",   // image url of the user from cloudinary
    }
}, {timestamps: true});

// using pre-save hook to hash password before saving user document
userSchema.pre('save', async function(){
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// custom method to compare password during login
userSchema.methods.isPasswordMatched = async function(enteredPassword){
    return bcrypt.compare(enteredPassword, this.password);
}

// custom method to generate access token
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        { 
            userId: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '4d' }
    );
};

export const User = mongoose.model('User', userSchema);