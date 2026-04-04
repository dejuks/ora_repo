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
      author_id: user.uuid, // UUID from users table
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

    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });

    res.json(manuscript);
  } catch (err) {
    console.error("GetOne error:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
};

// UPDATE
export const update = async (req, res) => {
  try {
    const updated = await model.updateManuscript(req.params.id, req.body);
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

// Drafts data
export const getDrafts = async (req, res) => {
  try {
    const drafts = await model.getDraftManuscripts();
    res.json(drafts);
  } catch (err) {
    console.error("GetDrafts error:", err);
    res.status(500).json({ error: "Failed to fetch drafts" });
  }
};

// Publish draft
export const publishDraft = async (req, res) => {
  try {
    const published = await model.publishDraftManuscript(req.params.id);
    res.json(published);
  } catch (err) {
    console.error("PublishDraft error:", err);
    res.status(500).json({ error: "Publish failed" });
  }
};

export const getPublished = async (req, res) => {
  try {
    const published = await model.getPublishedManuscripts();
    res.json(published);
  } catch (err) {
    console.error("GetPublished error:", err);
    res.status(500).json({ error: "Failed to fetch published manuscripts" });
  }
};

export const getByAuthor = async (req, res) => {
  try {
    const manuscripts = await model.getManuscriptsByAuthor(req.params.author_id);
    res.json(manuscripts);
  } catch (err) {
    console.error("GetByAuthor error:", err);
    res.status(500).json({ error: "Failed to fetch manuscripts by author" });
  }
};

export const search = async (req, res) => {
  try {
    const { q } = req.query;
    const results = await model.searchManuscripts(q);
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
};

export const filter = async (req, res) => {
  try {
    const { language, year } = req.query;
    const results = await model.filterManuscripts(language, year);
    res.json(results);
  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ error: "Filter failed" });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await model.getManuscriptStats();
    res.json(stats);
  } catch (err) {
    console.error("GetStats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const bulkUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const result = await model.bulkUploadManuscripts(file.path);
    res.json({ message: "Bulk upload successful", details: result });
  } catch (err) {
    console.error("BulkUpload error:", err);
    res.status(500).json({ error: "Bulk upload failed", details: err.message });
  }
};

export const exportData = async (req, res) => {
  try {
    const format = req.query.format || "csv";
    const filePath = await model.exportManuscripts(format);

    res.download(filePath, `manuscripts.${format}`, (err) => {
      if (err) {
        console.error("File download error:", err);
        res.status(500).json({ error: "File download failed" });
      }
    });
  } catch (err) {
    console.error("ExportData error:", err);
    res.status(500).json({ error: "Export failed", details: err.message });
  }
};

export const getRecent = async (req, res) => {
  try {
    const recent = await model.getRecentManuscripts();
    res.json(recent);
  } catch (err) {
    console.error("GetRecent error:", err);
    res.status(500).json({ error: "Failed to fetch recent manuscripts" });
  }
};  

// Revisions
export const getRevisions = async (req, res) => {
  try {
    const revisions = await model.getRevisionManuscripts();
    res.json(revisions);
  } catch (err) {
    console.error("GetRevisions error:", err);
    res.status(500).json({ error: "Failed to fetch revision manuscripts" });
  }
};