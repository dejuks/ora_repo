controller
import Ebook from "../models/Ebook.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/ebooks/';
    if (file.fieldname === 'cover') {
      uploadPath = 'uploads/covers/';
    }
    
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
    fileSize: 50 * 1024 * 1024, // 50MB
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

      const existingEbook = await Ebook.findById(id);
      if (!existingEbook) {
        return res.status(404).json({
          success: false,
          message: "Ebook not found"
        });
      }

      // Check permission (admin, editor, or the assigned editor)
      if (req.user.role !== 'admin' && 
          req.user.role !== 'editor' && 
          existingEbook.editor_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to update this ebook"
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

    const existingEbook = await Ebook.findById(id);
    if (!existingEbook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    // Check permission
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

// Delete manuscript file only
export const deleteManuscript = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEbook = await Ebook.findById(id);
    if (!existingEbook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    if (req.user.role !== 'admin' && 
        req.user.role !== 'editor' && 
        existingEbook.editor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this file"
      });
    }

    await Ebook.deleteManuscript(id);

    res.json({
      success: true,
      message: "Manuscript deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting manuscript:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting manuscript"
    });
  }
};

// Delete cover image only
export const deleteCover = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEbook = await Ebook.findById(id);
    if (!existingEbook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    if (req.user.role !== 'admin' && 
        req.user.role !== 'editor' && 
        existingEbook.editor_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this file"
      });
    }

    await Ebook.deleteCover(id);

    res.json({
      success: true,
      message: "Cover image deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting cover:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting cover image"
    });
  }
};

// Download manuscript
export const downloadManuscript = async (req, res) => {
  try {
    const { id } = req.params;

    const fileInfo = await Ebook.getFilePath(id);

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

    const fileName = fileInfo.file_name + path.extname(filePath);
    res.download(filePath, fileName);
  } catch (error) {
    console.error("Error downloading manuscript:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading manuscript"
    });
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

// Update ebook status only
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingEbook = await Ebook.findById(id);
    if (!existingEbook) {
      return res.status(404).json({
        success: false,
        message: "Ebook not found"
      });
    }

    // Only admin and editors can change status
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to change status"
      });
    }

    const ebook = await Ebook.updateStatus(id, status);

    res.json({
      success: true,
      message: "Status updated successfully",
      data: ebook
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status"
    });
  }
};

// Get ebooks by editor
export const getEbooksByEditor = async (req, res) => {
  try {
    const { editorId } = req.params;
    const ebooks = await Ebook.findByEditor(editorId);

    res.json({
      success: true,
      data: ebooks
    });
  } catch (error) {
    console.error("Error fetching editor ebooks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching editor ebooks"
    });
  }
};

/* ================= EDITOR: GET SCREENING FORM DATA ================= */
export async function getScreeningFormData(req, res) {
  const { id } = req.params;
  
  try {
    // Get available reviewers (users with reviewer role)
    // Assuming you have a roles column in users table
    const reviewers = await q(
      `SELECT uuid, full_name, email, affiliation 
       FROM users 
       WHERE roles @> '["REVIEWER"]' 
       AND is_active = true
       ORDER BY full_name`,
      []
    );
    
    const ebook = await q(
      `SELECT ebook_id, title, abstract, keywords, status, author_id,
              submitted_at
       FROM ebooks 
       WHERE ebook_id=$1 AND is_deleted=false`,
      [id]
    );
    
    if (!ebook.rows[0]) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    
    // Get author info
    const author = await q(
      `SELECT full_name, email FROM users WHERE uuid=$1`,
      [ebook.rows[0].author_id]
    );
    
    res.json({
      success: true,
      data: {
        ebook: {
          ...ebook.rows[0],
          author_name: author.rows[0]?.full_name,
          author_email: author.rows[0]?.email
        },
        reviewers: reviewers.rows
      }
    });
  } catch (err) {
    console.error("Error in getScreeningFormData:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ================= EDITOR: SUBMIT SCREENING ASSESSMENT ================= */
export async function submitScreeningAssessment(req, res) {
  const editorId = req.user.uuid;
  const { id } = req.params;
  const { 
    relevanceScore, 
    scopeMatch, 
    qualityScore, 
    comments,
    recommendedAction,
    reviewerIds = [] // array of reviewer UUIDs
  } = req.body;

  // Validate recommended action
  const validActions = ['SEND_TO_REVIEW', 'REQUEST_REVISION', 'REJECT'];
  if (!validActions.includes(recommendedAction)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid recommended action" 
    });
  }

  // If sending to review, require at least one reviewer
  if (recommendedAction === 'SEND_TO_REVIEW' && reviewerIds.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "At least one reviewer must be assigned" 
    });
  }

  await q("BEGIN");
  try {
    // Get current ebook status
    const ebook = await q(
      `SELECT * FROM ebooks WHERE ebook_id=$1 AND is_deleted=false FOR UPDATE`,
      [id]
    );
    
    if (!ebook.rows[0]) {
      await q("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // Only allow screening from SUBMITTED or SCREENING status
    if (!["SUBMITTED", "SCREENING"].includes(ebook.rows[0].status)) {
      await q("ROLLBACK");
      return res.status(400).json({ 
        success: false, 
        message: `Cannot screen from status ${ebook.rows[0].status}` 
      });
    }

    // Save the screening assessment
    await q(
      `INSERT INTO screening_assessments 
       (ebook_id, editor_id, relevance_score, scope_match, quality_score, 
        comments, recommended_action)
       VALUES($1, $2, $3, $4, $5, $6, $7)`,
      [
        id, 
        editorId, 
        relevanceScore, 
        scopeMatch, 
        qualityScore, 
        comments, 
        recommendedAction
      ]
    );

    // Determine next status and action based on recommendation
    let toStatus;
    let action;
    let historyNote = comments || '';
    
    switch(recommendedAction) {
      case 'SEND_TO_REVIEW':
        toStatus = "UNDER_REVIEW";
        action = "SEND_TO_REVIEW";
        historyNote = `Screening passed. Sent to peer review. ${comments || ''}`;
        
        // Assign reviewers
        for (const reviewerId of reviewerIds) {
          await q(
            `INSERT INTO review_assignments 
             (ebook_id, reviewer_id, assigned_by, status)
             VALUES($1, $2, $3, 'PENDING')`,
            [id, reviewerId, editorId]
          );
          
          // Optional: Send notification to reviewer
          // You could add a notification system here
        }
        
        if (reviewerIds.length > 0) {
          historyNote += ` Assigned ${reviewerIds.length} reviewer(s).`;
        }
        break;
        
      case 'REQUEST_REVISION':
        toStatus = "REVISION_REQUESTED";
        action = "REQUEST_REVISION";
        historyNote = `Revision requested after screening: ${comments || 'Needs corrections'}`;
        break;
        
      case 'REJECT':
        toStatus = "REJECTED";
        action = "DESK_REJECT";
        historyNote = `Rejected after screening: ${comments || 'Does not meet criteria'}`;
        break;
    }

    // Update ebook status
    await q(
      `UPDATE ebooks SET status=$1, updated_at=NOW() WHERE ebook_id=$2`,
      [toStatus, id]
    );

    // Log history
    await logHistory({
      ebookId: id,
      fromStatus: ebook.rows[0].status,
      toStatus,
      action,
      note: historyNote,
      actorId: editorId,
    });

    await q("COMMIT");
    
    return res.json({ 
      success: true, 
      message: `Screening completed: ${recommendedAction}`,
      data: { newStatus: toStatus }
    });
    
  } catch (err) {
    await q("ROLLBACK");
    console.error("Error in submitScreeningAssessment:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/* ================= REVIEWER: LIST MY PENDING REVIEWS ================= */
export async function listMyReviews(req, res) {
  const reviewerId = req.user.uuid;
  
  try {
    const assignments = await q(
      `SELECT ra.*, 
              e.ebook_id, e.title, e.abstract, e.keywords,
              u.full_name as author_name, u.email as author_email,
              a.full_name as assigned_by_name
       FROM review_assignments ra
       JOIN ebooks e ON e.ebook_id = ra.ebook_id
       JOIN users u ON u.uuid = e.author_id
       JOIN users a ON a.uuid = ra.assigned_by
       WHERE ra.reviewer_id = $1 
         AND ra.status = 'PENDING'
       ORDER BY ra.assigned_at DESC`,
      [reviewerId]
    );
    
    res.json({ success: true, data: assignments.rows });
  } catch (err) {
    console.error("Error in listMyReviews:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ================= REVIEWER: ACCEPT/DECLINE REVIEW ================= */
export async function respondToReview(req, res) {
  const reviewerId = req.user.uuid;
  const { assignmentId } = req.params;
  const { response } = req.body; // 'ACCEPTED' or 'DECLINED'
  
  if (!['ACCEPTED', 'DECLINED'].includes(response)) {
    return res.status(400).json({ success: false, message: "Invalid response" });
  }
  
  try {
    const assignment = await q(
      `SELECT * FROM review_assignments 
       WHERE assignment_id = $1 AND reviewer_id = $2`,
      [assignmentId, reviewerId]
    );
    
    if (!assignment.rows[0]) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    
    if (assignment.rows[0].status !== 'PENDING') {
      return res.status(400).json({ 
        success: false, 
        message: `Review already ${assignment.rows[0].status.toLowerCase()}` 
      });
    }
    
    await q(
      `UPDATE review_assignments 
       SET status = $1,
           ${response === 'ACCEPTED' ? 'accepted_at = NOW()' : ''}
       WHERE assignment_id = $2`,
      [response, assignmentId]
    );
    
    // Log to workflow history
    await logHistory({
      ebookId: assignment.rows[0].ebook_id,
      fromStatus: null,
      toStatus: null,
      action: response === 'ACCEPTED' ? 'REVIEW_ACCEPTED' : 'REVIEW_DECLINED',
      note: `Reviewer ${response === 'ACCEPTED' ? 'accepted' : 'declined'} review assignment`,
      actorId: reviewerId,
    });
    
    res.json({ success: true, message: `Review ${response.toLowerCase()}` });
  } catch (err) {
    console.error("Error in respondToReview:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ================= REVIEWER: SUBMIT REVIEW ================= */
export async function submitReview(req, res) {
  const reviewerId = req.user.uuid;
  const { assignmentId } = req.params;
  const { recommendation, comments, confidentialComments } = req.body;
  
  // Validate recommendation
  const validRecommendations = ['ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT'];
  if (!validRecommendations.includes(recommendation)) {
    return res.status(400).json({ success: false, message: "Invalid recommendation" });
  }
  
  try {
    // Check if assignment exists, is accepted, and belongs to reviewer
    const assignment = await q(
      `SELECT * FROM review_assignments 
       WHERE assignment_id = $1 AND reviewer_id = $2`,
      [assignmentId, reviewerId]
    );
    
    if (!assignment.rows[0]) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    
    if (assignment.rows[0].status !== 'ACCEPTED') {
      return res.status(400).json({ 
        success: false, 
        message: "Can only submit review for accepted assignments" 
      });
    }
    
    // Update assignment with review
    await q(
      `UPDATE review_assignments 
       SET status = 'COMPLETED', 
           recommendation = $1,
           comments = $2,
           confidential_comments = $3,
           completed_at = NOW()
       WHERE assignment_id = $4`,
      [recommendation, comments, confidentialComments, assignmentId]
    );
    
    // Log to workflow history
    await logHistory({
      ebookId: assignment.rows[0].ebook_id,
      fromStatus: null,
      toStatus: null,
      action: "REVIEW_SUBMITTED",
      note: `Review submitted with recommendation: ${recommendation}`,
      actorId: reviewerId,
    });
    
    // Check if all reviews are completed for this ebook
    const ebookId = assignment.rows[0].ebook_id;
    const pendingReviews = await q(
      `SELECT COUNT(*) FROM review_assignments 
       WHERE ebook_id = $1 AND status = 'PENDING'`,
      [ebookId]
    );
    
    const acceptedReviews = await q(
      `SELECT COUNT(*) FROM review_assignments 
       WHERE ebook_id = $1 AND status = 'ACCEPTED'`,
      [ebookId]
    );
    
    // If no pending reviews and all accepted reviews are done, update status
    if (parseInt(pendingReviews.rows[0].count) === 0 && 
        parseInt(acceptedReviews.rows[0].count) === 0) {
      
      // Get all completed recommendations to make a decision
      const completedReviews = await q(
        `SELECT recommendation FROM review_assignments 
         WHERE ebook_id = $1 AND status = 'COMPLETED'`,
        [ebookId]
      );
      
      // You might want to implement logic here to determine next step
      // based on review recommendations
      
      await q(
        `UPDATE ebooks SET status = 'REVIEW_COMPLETED', updated_at = NOW()
         WHERE ebook_id = $1`,
        [ebookId]
      );
      
      await logHistory({
        ebookId,
        fromStatus: "UNDER_REVIEW",
        toStatus: "REVIEW_COMPLETED",
        action: "REVIEWS_COMPLETED",
        note: "All peer reviews have been submitted",
        actorId: reviewerId,
      });
    }
    
    res.json({ success: true, message: "Review submitted successfully" });
    
  } catch (err) {
    console.error("Error in submitReview:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

/* ================= EDITOR: GET REVIEW SUMMARY ================= */
export async function getReviewSummary(req, res) {
  const { id } = req.params;
  
  try {
    const reviews = await q(
      `SELECT ra.*, 
              u.full_name as reviewer_name, u.email as reviewer_email
       FROM review_assignments ra
       JOIN users u ON u.uuid = ra.reviewer_id
       WHERE ra.ebook_id = $1
       ORDER BY ra.assigned_at`,
      [id]
    );
    
    const summary = {
      total: reviews.rows.length,
      pending: reviews.rows.filter(r => r.status === 'PENDING').length,
      accepted: reviews.rows.filter(r => r.status === 'ACCEPTED').length,
      declined: reviews.rows.filter(r => r.status === 'DECLINED').length,
      completed: reviews.rows.filter(r => r.status === 'COMPLETED').length,
      recommendations: {
        accept: reviews.rows.filter(r => r.recommendation === 'ACCEPT').length,
        minor: reviews.rows.filter(r => r.recommendation === 'MINOR_REVISION').length,
        major: reviews.rows.filter(r => r.recommendation === 'MAJOR_REVISION').length,
        reject: reviews.rows.filter(r => r.recommendation === 'REJECT').length
      }
    };
    
    res.json({ 
      success: true, 
      data: {
        reviews: reviews.rows,
        summary
      }
    });
  } catch (err) {
    console.error("Error in getReviewSummary:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}