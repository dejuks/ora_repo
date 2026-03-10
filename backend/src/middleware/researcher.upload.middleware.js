import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const userUploadDir = "uploads/users";
const publicationUploadDir = "uploads/publications";

if (!fs.existsSync(userUploadDir)) {
  fs.mkdirSync(userUploadDir, { recursive: true });
}
if (!fs.existsSync(publicationUploadDir)) {
  fs.mkdirSync(publicationUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Choose destination based on file type or purpose
    if (file.fieldname === 'photo') {
      cb(null, userUploadDir);
    } else if (file.fieldname === 'file' || file.fieldname === 'pdf') {
      cb(null, publicationUploadDir);
    } else {
      cb(null, userUploadDir); // default
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Image-only filter for profile photos
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for profile photos"));
  }
};

// PDF-only filter for publications
const pdfFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for publications"));
  }
};

// Combined filter for general uploads
const generalFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files and PDFs are allowed"));
  }
};

// Export different upload configurations
export const uploadProfilePhoto = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter,
});

export const uploadPublicationFile = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for publications
  fileFilter: pdfFilter,
});

export const uploadGeneral = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: generalFileFilter,
});

// Default export for backward compatibility
export default uploadGeneral;