// backend/middlewares/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // store files in memory
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"), false);
};

export const upload = multer({ storage, fileFilter });
