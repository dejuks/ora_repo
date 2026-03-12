// src/middleware/ebookUpload.middleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const dir = path.join(process.cwd(), "uploads", "ebooks");
fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`);
  },
});

export const ebookUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
