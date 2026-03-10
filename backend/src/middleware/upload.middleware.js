import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/* ================= PATH SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "../../");

/* ================= CREATE DIRECTORY ================= */
const createDirectory = (dir) => {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
};

/* ================= REQUIRED DIRECTORIES ================= */
[
  "uploads/users",
  "uploads/manuscripts",
  "uploads/cover_letters",
  "uploads/revisions",
].forEach(createDirectory);

/* ================= USER PHOTO STORAGE ================= */
const userPhotoStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.join(ROOT, "uploads/users"));
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `researcher-${unique}${ext}`);
  },
});

export const uploadUserPhoto = multer({
  storage: userPhotoStorage,
  fileFilter: (_, file, cb) => {
    const allowedMime = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed (.jpg .png .webp .gif)"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadUserPhotoSingle = uploadUserPhoto.single("photo");

/* ================= MANUSCRIPT STORAGE ================= */
const manuscriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover_letter") {
      cb(null, path.join(ROOT, "uploads/cover_letters"));
    } else if (file.fieldname === "revision_file") {
      cb(null, path.join(ROOT, "uploads/revisions"));
    } else {
      cb(null, path.join(ROOT, "uploads/manuscripts"));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);

    if (file.fieldname === "cover_letter") {
      cb(null, `cover-${unique}${ext}`);
    } else if (file.fieldname === "revision_file") {
      const id = req.params.id || "unknown";
      cb(null, `revision-${id}-${unique}${ext}`);
    } else {
      cb(null, `manuscript-${unique}${ext}`);
    }
  },
});

/* ================= FILE FILTERS ================= */
const manuscriptFilter = (req, file, cb) => {
  const allowedExt = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) cb(null, true);
  else cb(new Error("Invalid manuscript file type"));
};

const coverFilter = (req, file, cb) => {
  const allowedExt = [".pdf", ".doc", ".docx", ".txt", ".rtf"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) cb(null, true);
  else cb(new Error("Invalid cover letter file type"));
};

/* ================= UPLOAD EXPORTS ================= */
export const uploadManuscriptSingle = multer({
  storage: manuscriptStorage,
  fileFilter: manuscriptFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("manuscript_file");

export const uploadCoverLetterSingle = multer({
  storage: manuscriptStorage,
  fileFilter: coverFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("cover_letter");

export const uploadManuscriptWithCover = multer({
  storage: manuscriptStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "manuscript_file")
      return manuscriptFilter(req, file, cb);

    if (file.fieldname === "cover_letter")
      return coverFilter(req, file, cb);

    cb(new Error("Unexpected file field"));
  },
}).fields([
  { name: "manuscript_file", maxCount: 1 },
  { name: "cover_letter", maxCount: 1 },
]);

/* ================= DELETE FILE HELPER ================= */
export const deleteFile = (filePath) => {
  if (!filePath) return;

  const full = path.join(ROOT, filePath);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
  }
};

/* ================= ERROR HANDLER ================= */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

/* ================= DEFAULT EXPORT ================= */
export default {
  uploadUserPhotoSingle,
  uploadManuscriptSingle,
  uploadCoverLetterSingle,
  uploadManuscriptWithCover,
  deleteFile,
  handleUploadError,
};
