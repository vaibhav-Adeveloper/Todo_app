import { Router } from "express";
import { upload } from '../middlewares/multer.middleware.js';
import { getAppStatus, getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Define user-related routes here 
router.route('/status').get(getAppStatus);
// sign-up route
router.route('/signup').post(upload.single('profileImage'), registerUser);
// login route
router.route('/login').post(loginUser);

// secured routes.
router.route('/current').get(verifyJWT, getCurrentUser);
router.route('/logout').post(verifyJWT, logoutUser);

export default router;