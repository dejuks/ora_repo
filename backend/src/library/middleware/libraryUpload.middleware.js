import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "digital");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
  },
});

const allowedTypes = new Set([
  "application/pdf",
  "application/epub+zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "text/plain",
]);

const fileFilter = (req, file, cb) => {
  if (!allowedTypes.has(file.mimetype)) return cb(new Error("Invalid file type"), false);
  cb(null, true);
};

export const uploadDigitalFile = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
