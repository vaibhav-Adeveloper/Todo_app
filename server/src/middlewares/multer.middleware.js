import multer from "multer";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { ApiError } from "../utils/apiError.js";

const uploadDirectory = fileURLToPath(new URL("../../public/temp/", import.meta.url));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Profile image must be an image file"));
      return;
    }
    cb(null, true);
  },
});
