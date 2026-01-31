import { RepositoryItem } from "../models/repositoryItem.model.js";
import path from "path";
import fs from "fs";


import natural from "natural";
import sw from "stopword";

// OR, if you are using ES modules:
import stringSimilarity from 'string-similarity';

// Create item
export const createItem = async (req, res) => {
  try {
    // 1️⃣ DUPLICATE CHECK
    const duplicate = await RepositoryItem.findDuplicate({
      title: req.body.title,
      doi: req.body.doi,
      handle: req.body.handle
    });

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        message: "Repository item already exists",
        existing_item: duplicate.rows[0]
      });
    }

    // 2️⃣ FILE UPLOAD
    let filePath = null;
    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;
    }

    // 3️⃣ PREPARE DATA
    const data = {
      title: req.body.title,
      abstract: req.body.abstract ?? null,
      item_type: req.body.item_type,
      language: req.body.language,
      doi: req.body.doi ?? null,
      status: "draft" ?? null,
      handle: req.body.handle ?? null,
      access_level: req.body.access_level,
      embargo_until:
        req.body.embargo_until && req.body.embargo_until !== ""
          ? req.body.embargo_until
          : null,
      file_path: filePath
    };

    // 4️⃣ INSERT
    const result = await RepositoryItem.create(data, req.user.uuid);

    return res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error("Create item error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Duplicate repository item detected"
      });
    }

    return res.status(500).json({
      message: "Failed to create repository item"
    });
  }
};
// Get all items
export const getItems = async (req, res) => {
  try {
    const result = await RepositoryItem.findAll();
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items" });
  }
};

// Get single item
export const getItem = async (req, res) => {
  try {
    const result = await RepositoryItem.findById(req.params.uuid);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch item" });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    let filePath = req.body.existing_file_path || null;

    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;
      // Optional: delete old file if exists
      if (req.body.existing_file_path) {
        const oldPath = path.join(process.cwd(), "public", req.body.existing_file_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const data = {
      ...req.body,
      embargo_until:
        req.body.embargo_until && req.body.embargo_until !== ""
          ? req.body.embargo_until
          : null,
      file_path: filePath
    };

    const result = await RepositoryItem.update(req.params.uuid, data);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({ message: "Failed to update item" });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    // Optionally delete file from disk
    const item = await RepositoryItem.findById(req.params.uuid);
    if (item.rows[0]?.file_path) {
      const filePath = path.join(process.cwd(), "public", item.rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await RepositoryItem.delete(req.params.uuid);
    res.json({ message: "Repository item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item" });
  }
};


// Get new submissions for curator
export const getCuratorNewQueue = async (req, res) => {
  try {
    const result = await RepositoryItem.findByStatus("submitted");
    res.json(result.rows);
  } catch (error) {
    console.error("Curator new queue error:", error);
    res.status(500).json({ message: "Failed to fetch new submissions" });
  }
};

// Approve item
export const approveRepositoryItem = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const result = await RepositoryItem.updateStatus(uuid, "approved");
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Approve item error:", error);
    res.status(500).json({ message: "Failed to approve item" });
  }
};

// Reject item
export const rejectRepositoryItem = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const reason = req.body.reason;
    const result = await RepositoryItem.updateStatus(uuid, "rejected", reason);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Reject item error:", error);
    res.status(500).json({ message: "Failed to reject item" });
  }
};


// Request revision
export const requestRevision = async (req, res) => {
  try {
    const uuid = req.params.uuid;
    const comment = req.body.comment;
    const result = await RepositoryItem.updateStatus(uuid, "revision_required", null, comment);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Revision request error:", error);
    res.status(500).json({ message: "Failed to request revision" });
  }
};
export const suggestMetadata = async (req, res) => {
  try {
    const { suggested_title, suggested_abstract, keywords } = req.body;
    const { uuid } = req.params;

    const result = await RepositoryItem.updateMetadata(uuid, {
      suggested_title,
      suggested_abstract,
      keywords
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Suggest metadata error:", error);
    res.status(500).json({ message: "Failed to suggest metadata" });
  }
};

export const analyzeVocabulary = async (req, res) => {
  try {
    const { uuid } = req.params;
    const item = await RepositoryItem.findById(uuid);

    if (!item.rows.length) return res.status(404).json({ message: "Item not found" });

    const text = item.rows[0].abstract || "";
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text.toLowerCase());
    const filtered = sw.removeStopwords(tokens);

    const frequency = {};
    filtered.forEach(word => frequency[word] = (frequency[word] || 0) + 1);

    res.json(frequency);
  } catch (error) {
    console.error("Vocabulary analysis error:", error);
    res.status(500).json({ message: "Failed to analyze vocabulary" });
  }
};

export const checkCopyright = async (req, res) => {
  try {
    const { uuid } = req.params;
    const item = await RepositoryItem.findById(uuid);

    if (!item.rows.length) return res.status(404).json({ message: "Item not found" });

    // Example: compare abstract against all other items
    const allItems = await RepositoryItem.findAll();
    let maxSimilarity = 0;
    allItems.rows.forEach(i => {
      if (i.uuid !== uuid) {
        const sim = stringSimilarity.compareTwoStrings(item.rows[0].abstract, i.abstract);
        if (sim > maxSimilarity) maxSimilarity = sim;
      }
    });

    res.json({ similarity_score: maxSimilarity });
  } catch (error) {
    console.error("Copyright check error:", error);
    res.status(500).json({ message: "Failed to check copyright" });
  }
};

export const getItemsByStatusAndUser = async (status, userId) => {
  return pool.query(
    `SELECT * FROM repository_items WHERE status=$1 AND submitter_id=$2 ORDER BY created_at DESC`,
    [status, userId]
  );
};

// PATCH /api/repository-items/:uuid/submit
export const submitDraftItem = async (req, res) => {
  try {
    const { uuid } = req.params;
    // Update the draft status to "submitted"
    const result = await RepositoryItem.updateStatus(uuid, "submitted");
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Submit draft error:", error);
    res.status(500).json({ message: "Failed to submit draft" });
  }
};
export const getAuthorDrafts = async (req, res) => {
  try {
    const result = await RepositoryItem.findByStatusAndUser("draft", req.user.uuid);
    res.json(result.rows);
  } catch (error) {
    console.error("Get author drafts error:", error);
    res.status(500).json({ message: "Failed to fetch drafts" });
  }
};
export const getAuthorDepositsUnderReview = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await RepositoryItem.findByAuthorAndStatuses(userId, [
      "submitted",
      "in_progress"
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error("Author deposits review error:", error);
    res.status(500).json({ message: "Failed to fetch deposits under review" });
  }
};
export const getReturnedDeposits = async (req, res) => {
  try {
    const userId = req.user.uuid; // ✅ FIXED (was req.user.id)

    const result = await RepositoryItem.findByAuthorAndStatuses(userId, [
      "return to revisions",
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error("Returned deposits error:", error);
    res.status(500).json({
      message: "Failed to fetch returned deposits",
    });
  }
};

export const getApprovedDeposits = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const result = await RepositoryItem.findByAuthorAndStatuses(userId, [
      "approved",
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error("Approved deposits error:", error);
    res.status(500).json({
      message: "Failed to fetch approved deposits",
    });
  }
};
// Backend controller
export const searchRepositoryItems = async (req, res) => {
  try {
    const query = req.query.query ?? "";
    const filterLetter = req.query.filterLetter ?? "";
    const page = Number(req.query.page) || 1;

    const limit = 10;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];
    let i = 1;

    if (query.trim()) {
      where.push(`title::TEXT ILIKE $${i++}`);
      params.push(`%${query}%`);
    }

    if (filterLetter.trim()) {
      where.push(`title::TEXT ILIKE $${i++}`);
      params.push(`${filterLetter}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const dataSQL = `
      SELECT *
      FROM repository_items
      ${whereSQL}
      LIMIT $${i} OFFSET $${i + 1}
    `;

    const data = await pool.query(dataSQL, [...params, limit, offset]);

    const countSQL = `
      SELECT COUNT(*) AS total
      FROM repository_items
      ${whereSQL}
    `;

    const count = await pool.query(countSQL, params);

    res.json({
      data: data.rows,
      total: Number(count.rows[0].total),
      page,
      totalPages: Math.ceil(count.rows[0].total / limit),
    });

  } catch (err) {
    console.error("❌ POSTGRES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch item" });
  }
};
