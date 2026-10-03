import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "../utils/apiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (imageLocalPath) => {
  if (!imageLocalPath) {
    throw new ApiError(400, "Profile image is required");
  }

  try {
    const uploadedImage = await cloudinary.uploader.upload(imageLocalPath);
    if (!uploadedImage?.secure_url) {
      throw new ApiError(502, "Image upload did not return a secure URL");
    }
    return uploadedImage.secure_url;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(502, "Failed to upload profile image");
  }
};

export { uploadOnCloudinary };
