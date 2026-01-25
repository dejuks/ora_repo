import Manuscript from "../models/manuscript.model.js";
import fs from "fs";
import path from "path";

/* LIST ALL */
export const getManuscripts = async (req, res) => {
  try {
    const manuscripts = await Manuscript.findAll();
    res.json(manuscripts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manuscripts" });
  }
};

/* GET ONE */
export const getManuscript = async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });
    res.json(manuscript);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manuscript" });
  }
};

/* CREATE */
export const createManuscript = async (req, res) => {
  try {
    const manuscript_files = req.file
      ? `/uploads/manuscripts/${req.file.filename}`
      : null;

    const manuscript = await Manuscript.create({
      ...req.body,
      manuscript_files,
      author_ids: req.body.author_ids
        ? JSON.parse(req.body.author_ids)
        : [],
    });

    res.status(201).json(manuscript);
  } catch (err) {
    console.error("Error creating manuscript:", err);
    res.status(500).json({ message: err.message });
  }
};


/* UPDATE */
export const updateManuscript = async (req, res) => {
  try {
    // Handle file upload
    if (req.file) {
      req.body.manuscript_file = req.file.path;
    }

    const manuscript = await Manuscript.update(req.params.id, req.body);
    res.json(manuscript);
  } catch (err) {
    console.error("Error updating manuscript:", err);
    res.status(500).json({ error: err.message || "Failed to update manuscript" });
  }
};

/* UPDATE STATUS ONLY */
export const updateManuscriptStatus = async (req, res) => {
  try {
    const { status_id } = req.body;
    const manuscript = await Manuscript.updateStatus(req.params.id, status_id);
    res.json(manuscript);
  } catch (err) {
    console.error("Error updating manuscript status:", err);
    res.status(500).json({ error: err.message || "Failed to update status" });
  }
};

/* DELETE */
export const deleteManuscript = async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) return res.status(404).json({ error: "Manuscript not found" });

    // Delete associated file if exists
    if (manuscript.manuscript_file && fs.existsSync(manuscript.manuscript_file)) {
      fs.unlinkSync(manuscript.manuscript_file);
    }

    await Manuscript.delete(req.params.id);
    res.json({ message: "Manuscript deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete manuscript" });
  }
};
