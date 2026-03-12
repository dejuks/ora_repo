import multer from "multer";
import path from "path";
import fs from "fs";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const base = "uploads/ebooks";
    const dir = file.fieldname === "cover" ? path.join(base, "covers") : path.join(base, "manuscripts");
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${safe}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === "cover") {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Cover must be an image"), false);
    return cb(null, true);
  }

  // manuscript
  const allowedExt = /\.(pdf|doc|docx|epub|txt)$/i;
  if (!allowedExt.test(file.originalname)) return cb(new Error("Invalid manuscript type"), false);

  cb(null, true);
}

export const ebookUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
}).fields([
  { name: "manuscript", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);