import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "ebooks");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const base = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

export const uploadEbookFile = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});