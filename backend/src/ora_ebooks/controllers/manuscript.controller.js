import * as model from "../models/manuscript.model.js";

// CREATE
export const create = async (req, res) => {
  try {
    const user = req.user;

    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    const file = req.file;
    const data = {
      ...req.body,
      file_path: file ? file.path : null,
      author_id: user.uuid,
    };

    const result = await model.createManuscript(data);
    res.json(result);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: "Create failed", details: err.message });
  }
};

// DELETE MANUSCRIPT
export const deleteManuscript = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: "Invalid manuscript ID format" });
    }
    
    // Check if manuscript exists and user has permission
    const existing = await model.getManuscriptById(id);
    if (!existing) {
      return res.status(404).json({ error: "Manuscript not found" });
    }
    
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.some(r => r.role_name === 'admin' || r.name === 'admin');
    const isAuthor = existing.author_id === user?.uuid;
    
    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: "Only authors or admins can delete manuscripts" });
    }
    
    await model.deleteManuscript(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// GET ALL MANUSCRIPTS (admin only)
export const getAllManuscripts = async (req, res) => {
  try {
    const user = req.user;
    const userRoles = user?.roles || [];
    const isAdmin = userRoles.some(r => r.role_name === 'admin' || r.name === 'admin');
    
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const manuscripts = await model.getManuscripts();
    res.json(manuscripts);
  } catch (err) {
    console.error("GetAllManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch all manuscripts" });
  }
};
//getAssignedManuscripts
export const getAssignedManuscripts = async (req, res) => {
  try {
    const user = req.user;
    const manuscripts = await model.getAssignedManuscripts(user.uuid);
    res.json(manuscripts);
  } catch (err) {
    console.error("GetAssignedManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch assigned manuscripts" });
  }
};

export const getForReviewManuscripts = async (req, res) => {
  try {
    const user = req.user;
    const manuscripts = await model.getForReviewManuscripts(user.uuid);
    res.json(manuscripts);
  } catch (err) {
    console.error("GetForReviewManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts for review" });
  }
};
// getManuscriptById
export const getManuscriptById = async (req, res) => {
  try {
    const { id } = req.params;
    const manuscript = await model.getManuscriptById(id);

    if (!manuscript) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json(manuscript);
  } catch (err) {
    console.error("GetManuscriptById error:", err);
    res.status(500).json({ error: "Failed to fetch manuscript" });
  }
};

//getManuscripts
export const getManuscripts = async (req, res) => {
  try {
    const manuscripts = await model.getManuscripts();
    res.json(manuscripts);
  } catch (err) {
    console.error("GetManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};
//getMyManuscripts
export const getMyManuscripts = async (req, res) => {
  try {
    const user = req.user;
    const manuscripts = await model.getMyManuscripts(user.uuid);
    res.json(manuscripts);
  } catch (err) {
    console.error("GetMyManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch your manuscripts" });
  }
};
//updateManuscript
export const updateManuscript = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
    };

    if (req.file) {
      data.file_path = req.file.path;
    }

    const updated = await model.updateManuscript(id, data);
    res.json(updated);
  } catch (err) {
    console.error("UpdateManuscript error:", err);
    res.status(500).json({ error: "Failed to update manuscript" });
  }
};
//uploadFile
export const uploadFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const updated = await model.updateManuscript(id, { file_path: req.file.path });
    res.json(updated);
  } catch (err) {
    console.error("UploadFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

// CREATE
export const createManuscript = async (req, res) => {
  try {
    const user = req.user;

    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    const file = req.file;
    const data = {
      ...req.body,
      file_path: file ? file.path : null,
      author_id: user.uuid,
    };

    const result = await model.createManuscript(data);
    res.status(201).json(result);  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ error: "Create failed", details: err.message });
  }
};
// GET ALL
export const getAll = async (req, res) => {
  try {
    const manuscripts = await model.getManuscripts();
    res.json(manuscripts);
  } catch (err) {
    console.error("GetAll error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};

// GET ONE
export const getOne = async (req, res) => {
  try {
    const manuscript = await model.getManuscriptById(req.params.id);

    if (!manuscript) {
      return res.status(404).json({ error: "Manuscript not found" });
    }

    res.json(manuscript);
  } catch (err) {
    console.error("GetOne error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// UPDATE
export const update = async (req, res) => {
  try {
    const data = {
      ...req.body,
    };

    if (req.file) {
      data.file_path = req.file.path;
    }

    const updated = await model.updateManuscript(req.params.id, data);
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

// DELETE
export const remove = async (req, res) => {
  try {
    await model.deleteManuscript(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

// DRAFTS
// DRAFTS - Get all draft manuscripts for the current user
export const getDrafts = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const drafts = await model.getDraftManuscripts(user.uuid);
    res.json(drafts);
  } catch (err) {
    console.error("GetDrafts error:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};

// REVISIONS
export const getRevisions = async (req, res) => {
  try {
    const revisions = await model.getRevisionManuscripts();
    res.json(revisions);
  } catch (err) {
    console.error("GetRevisions error:", err);
    res.status(500).json({ error: "Failed to fetch revision manuscripts" });
  }
};

// SCREENED
export const getScreened = async (req, res) => {
  try {
    const screened = await model.getScreenedManuscripts();
    res.json(screened);
  } catch (err) {
    console.error("GetScreened error:", err);
    res.status(500).json({ error: "Failed to fetch screened manuscripts" });
  }
};

// SCREENING
export const screeningHandler = async (req, res) => {
  const { id } = req.params;
  const editorId = req.user?.uuid || req.user?.id;

  const {
    relevance_score,
    scope_match,
    quality_score,
    comments,
    recommended_action,
  } = req.body;

  try {
    if (
      !id ||
      relevance_score === undefined ||
      quality_score === undefined ||
      !scope_match ||
      !comments ||
      !recommended_action
    ) {
      return res.status(400).json({
        error: "All screening fields are required",
      });
    }

    const result = await model.screenManuscript({
      id,
      editorId,
      relevance_score,
      scope_match,
      quality_score,
      comments,
      recommended_action,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Screening error:", error);

    if (error.message === "Manuscript not found") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "Only submitted manuscripts can be screened") {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === "Invalid recommended action") {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: "Failed to screen manuscript",
    });
  }
};
// GET REVISION REQUIRED MANUSCRIPTS (for logged-in author)
export const getRevisionRequiredManuscripts = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const revisions = await model.getRevisionRequiredManuscripts(user.uuid);
    res.json(revisions);
  } catch (err) {
    console.error("GetRevisionRequiredManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch revision manuscripts" });
  }
};


// GET PAYMENT ORDERED MANUSCRIPTS
export const getPaymentOrderedManuscripts = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const manuscripts = await model.getPaymentOrderedManuscripts(user.uuid);
    res.json(manuscripts);
  } catch (err) {
    console.error("GetPaymentOrderedManuscripts error:", err);
    res.status(500).json({ error: "Failed to fetch payment ordered manuscripts" });
  }
};

// GET PAYMENT ORDERED COUNT
export const getPaymentOrderedCount = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const count = await model.getPaymentOrderedCount(user.uuid);
    res.json({ count });
  } catch (err) {
    console.error("GetPaymentOrderedCount error:", err);
    res.status(500).json({ error: "Failed to fetch payment ordered count" });
  }
};

// UPDATE PAYMENT STATUS
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    
    if (!user?.uuid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const updated = await model.updatePaymentStatus(id, status);
    res.json(updated);
  } catch (err) {
    console.error("UpdatePaymentStatus error:", err);
    res.status(500).json({ error: "Failed to update payment status" });
  }
};
