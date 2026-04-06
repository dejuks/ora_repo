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
export const getDrafts = async (req, res) => {
  try {
    const drafts = await model.getDraftManuscripts();
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