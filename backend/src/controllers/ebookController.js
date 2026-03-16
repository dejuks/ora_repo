// controllers/ebookController.js
import Ebook from "../models/Ebook.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/ebooks/';
    if (file.fieldname === 'cover') {
      uploadPath = 'uploads/covers/';
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'manuscript') {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
      'text/plain'
    ];
    const allowedExt = ['.pdf', '.doc', '.docx', '.epub', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid manuscript file type. Allowed: PDF, DOC, DOCX, EPUB, TXT'), false);
    }
  } else if (file.fieldname === 'cover') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid cover image type. Allowed: JPG, PNG, GIF'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for manuscripts
  }
}).fields([
  { name: 'manuscript', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

// Create ebook
export const createEbook = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const ebookData = JSON.parse(req.body.data);
      
      // Validate required fields
      if (!ebookData.title) {
        return res.status(400).json({
          success: false,
          message: "Title is required"
        });
      }

      const ebook = await Ebook.create(ebookData, req.files, req.user.id);

      res.status(201).json({
        success: true,
        message: "Ebook created successfully",
        data: ebook
      });
    } catch (error) {
      console.error("Error creating ebook:", error);
      res.status(500).json({
        success: false,
        message: "Error creating ebook"
      });
    }
  });
};

// Get all ebooks
export const getAllEbooks = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      language: req.query.language,
      editor_id: req.query.editor_id,
      search: req.query.search
    };

    const ebooks = await Ebook.findAll(filters);

    res.json({
      success: true,
      data: ebooks,
      total: ebooks.length
    });
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ebooks"
    });
  }
};

// Get ebook by ID
export const getEbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const ebook = await Ebook.findById(id);

    if (!ebook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    res.json({
      success: true,
      data: ebook
    });
  } catch (error) {
    console.error("Error fetching ebook:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ebook"
    });
  }
};

// Update ebook
export const updateEbook = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { id } = req.params;
      const ebookData = JSON.parse(req.body.data);

      // Check if ebook exists
      const existingEbook = await Ebook.findById(id);
      if (!existingEbook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found"
        });
      }

      const ebook = await Ebook.update(id, ebookData, req.files, req.user.id);

      res.json({
        success: true,
        message: "Ebook updated successfully",
        data: ebook
      });
    } catch (error) {
      console.error("Error updating ebook:", error);
      res.status(500).json({
        success: false,
        message: "Error updating ebook"
      });
    }
  });
};

// Delete ebook
export const deleteEbook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ebook exists
    const existingEbook = await Ebook.findById(id);
    if (!existingEbook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    // Check permission (only author, editor, or admin can delete)
    if (req.user.role !== 'admin' && 
        req.user.role !== 'editor' && 
        existingEbook.editor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this ebook"
      });
    }

    await Ebook.delete(id);

    res.json({
      success: true,
      message: "Ebook deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting ebook:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting ebook"
    });
  }
};

// Download manuscript
export const downloadManuscript = async (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.query;

    const fileInfo = await Ebook.getFilePath(id, version);

    if (!fileInfo || !fileInfo.file_path) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    const filePath = fileInfo.file_path;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server"
      });
    }

    const fileName = fileInfo.file_name || path.basename(filePath);
    res.download(filePath, fileName);
  } catch (error) {
    console.error("Error downloading manuscript:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading manuscript"
    });
  }
};

// Get file versions
export const getFileVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const versions = await Ebook.getFileVersions(id);

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    console.error("Error fetching file versions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching file versions"
    });
  }
};

// Delete file version
export const deleteFileVersion = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id, versionId } = req.params;

    await client.query('BEGIN');

    // Get file info
    const fileInfo = await client.query(
      'SELECT file_path, is_current FROM ebook_files WHERE id = $1 AND ebook_id = $2',
      [versionId, id]
    );

    if (fileInfo.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "File version not found"
      });
    }

    // Don't allow deletion of current version
    if (fileInfo.rows[0].is_current) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete current version. Please upload a new version first."
      });
    }

    // Delete physical file
    if (fileInfo.rows[0].file_path && fs.existsSync(fileInfo.rows[0].file_path)) {
      fs.unlinkSync(fileInfo.rows[0].file_path);
    }

    // Delete from database
    await client.query('DELETE FROM ebook_files WHERE id = $1', [versionId]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "File version deleted successfully"
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting file version:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting file version"
    });
  } finally {
    client.release();
  }
};

// Get ebook statistics
export const getEbookStats = async (req, res) => {
  try {
    const stats = await Ebook.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error fetching ebook stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching ebook statistics"
    });
  }
};

// Bulk update status
export const bulkUpdateStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { ids, status } = req.body;

    if (!ids || !ids.length || !status) {
      return res.status(400).json({
        success: false,
        message: "Please provide ebook IDs and status"
      });
    }

    await client.query('BEGIN');

    const query = `
      UPDATE ebooks 
      SET status = $1, updated_at = NOW()
      WHERE id = ANY($2::uuid[])
      RETURNING id, title, status
    `;

    const result = await client.query(query, [status, ids]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `${result.rowCount} ebooks updated successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error bulk updating ebooks:", error);
    res.status(500).json({
      success: false,
      message: "Error updating ebooks"
    });
  } finally {
    client.release();
  }
};