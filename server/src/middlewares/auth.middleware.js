// middleware to authenticate user using JWT token from cookies
// and attach user info to req.user
// middleware that just checks whether the user is logged in or not.

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { isDemoMode } from "../utils/demoMode.js";
import { getDemoUser } from "../utils/demoStore.js";

export const verifyJWT = asyncHandler( async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if(!token){
        throw new ApiError(401, 'Unauthorized access, token missing');
    }

    if (isDemoMode) {
        if (token !== "demo-session") {
            throw new ApiError(401, 'Invalid or expired demo session');
        }
        req.user = getDemoUser();
        next();
        return;
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await User.findById(decodedToken.userId).select('-password');
    if(!user){
        throw new ApiError(401, 'Invalid token, user not found');
    }
    req.user = user;
    next();
})