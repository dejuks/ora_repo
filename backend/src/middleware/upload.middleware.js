import multer from "multer";
import fs from "fs";
import path from "path";

// ========== HELPER FUNCTIONS ==========
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create all necessary directories
const directories = [
  "uploads/users",
  "uploads/manuscripts",
  "uploads/cover_letters",
  "uploads/revisions"              
];

directories.forEach(dir => createDirectory(dir));

// ========== USER PHOTO UPLOAD CONFIGURATION ==========
const userPhotoStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "uploads/users");
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, `user-${uniqueSuffix}${ext}`);
  },
});

export const uploadUserPhoto = multer({
  storage: userPhotoStorage,
  fileFilter: (_, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedExtensions = [".jpeg", ".jpg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for user photos
  }
});

// ========== MANUSCRIPT FILE UPLOAD CONFIGURATION ==========
const manuscriptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "cover_letter") {
      cb(null, "uploads/cover_letters/");
    } else if (file.fieldname === "revision_file") {
      cb(null, "uploads/revisions/");
    } else {
      cb(null, "uploads/manuscripts/");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const originalName = path.parse(file.originalname).name;
    
    if (file.fieldname === "cover_letter") {
      cb(null, `cover-letter-${uniqueSuffix}${ext}`);
    } else if (file.fieldname === "revision_file") {
      const manuscriptId = req.params.id || req.body.manuscript_id || "unknown";
      cb(null, `revision-${manuscriptId}-v${req.body.version || "1"}-${uniqueSuffix}${ext}`);
    } else {
      cb(null, `manuscript-${uniqueSuffix}${ext}`);
    }
  }
});

// Manuscript file filter
const manuscriptFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf",
    "application/vnd.oasis.opendocument.text"
  ];
  
  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`), false);
  }
};

// Cover letter file filter
const coverLetterFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf"
  ];
  
  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt", ".rtf"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for cover letter. Only ${allowedExtensions.join(', ')} files are allowed.`), false);
  }
};

// ========== EXPORTED UPLOAD MIDDLEWARE ==========

// 1. User Photo Upload
export const uploadUserPhotoSingle = uploadUserPhoto.single("photo");

// 2. Manuscript File Upload (single file)
export const uploadManuscriptSingle = multer({
  storage: manuscriptStorage,
  fileFilter: manuscriptFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single("manuscript_file");

// 3. Cover Letter Upload (single file)
export const uploadCoverLetterSingle = multer({
  storage: manuscriptStorage,
  fileFilter: coverLetterFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for cover letters
  }
}).single("cover_letter");

// 4. Manuscript with Cover Letter (multiple files)
export const uploadManuscriptWithCover = multer({
  storage: manuscriptStorage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "manuscript_file") {
      return manuscriptFileFilter(req, file, cb);
    }
    if (file.fieldname === "cover_letter") {
      return coverLetterFileFilter(req, file, cb);
    }
    cb(new Error("Unexpected field"), false);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
  }
}).fields([
  { name: "manuscript_file", maxCount: 1 },
  { name: "cover_letter", maxCount: 1 }
]);

// 5. Revision Upload
export const uploadRevision = multer({
  storage: manuscriptStorage,
  fileFilter: manuscriptFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
}).single("revision_file");

// 6. Multiple manuscript files (for bulk upload)
export const uploadMultipleManuscripts = multer({
  storage: manuscriptStorage,
  fileFilter: manuscriptFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
}).array("manuscript_files", 10); // Max 10 files

// ========== HELPER FUNCTIONS FOR FILE MANAGEMENT ==========

// Delete file helper
export const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath || !fs.existsSync(filePath)) {
      resolve(false);
      return;
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

// Get file info
export const getFileInfo = (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath);
  const filename = path.basename(filePath);
  
  return {
    path: filePath,
    filename,
    extension: ext,
    size: stats.size,
    sizeFormatted: formatFileSize(stats.size),
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
    isDirectory: stats.isDirectory()
  };
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validate file type
export const validateFileType = (file, allowedTypes, allowedExtensions) => {
  const ext = path.extname(file.originalname).toLowerCase();
  return allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext);
};

// Get allowed file types for UI display
export const getAllowedFileTypes = (type = "manuscript") => {
  const types = {
    user_photo: {
      extensions: [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      mimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
      maxSize: "5MB"
    },
    manuscript: {
      extensions: [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"],
      mimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf",
        "application/vnd.oasis.opendocument.text"
      ],
      maxSize: "10MB"
    },
    cover_letter: {
      extensions: [".pdf", ".doc", ".docx", ".txt", ".rtf"],
      mimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf"
      ],
      maxSize: "5MB"
    }
  };
  
  return types[type] || types.manuscript;
};

// Clean up old files (optional - can be run as cron job)
export const cleanupOldFiles = (directory, maxAgeInDays = 30) => {
  if (!fs.existsSync(directory)) {
    return;
  }
  
  const now = Date.now();
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error getting file stats:", err);
          return;
        }
        
        const fileAge = now - stats.mtime.getTime();
        if (fileAge > maxAge) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting old file:", err);
            } else {
              console.log(`Deleted old file: ${filePath}`);
            }
          });
        }
      });
    });
  });
};

// Middleware to handle upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${err.field === "photo" ? "5MB" : "10MB"}`
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded"
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field"
      });
    }
  }
  
  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Middleware to check if file was uploaded
export const requireFile = (fieldName) => {
  return (req, res, next) => {
    if (!req.file && (!req.files || !req.files[fieldName])) {
      return res.status(400).json({
        success: false,
        message: `No file uploaded for ${fieldName}`
      });
    }
    next();
  };
};

export default {
  uploadUserPhoto,
  uploadUserPhotoSingle,
  uploadManuscriptSingle,
  uploadCoverLetterSingle,
  uploadManuscriptWithCover,
  uploadRevision,
  uploadMultipleManuscripts,
  deleteFile,
  getFileInfo,
  formatFileSize,
  validateFileType,
  getAllowedFileTypes,
  cleanupOldFiles,
  handleUploadError,
  requireFile
};