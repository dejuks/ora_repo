import { RepositoryItem } from "../models/repositoryItem.model.js";
import { validate as isUUID } from "uuid";
import pool from "../../../config/db.js";

import path from "path";
import fs from "fs";

import natural from "natural";
import sw from "stopword";
import stringSimilarity from "string-similarity";



/* ===============================
   CREATE ITEM
=============================== */
export const createItem = async (req, res) => {
  try {
    console.log("REQ.FILE:", req.file); // 🔥 DEBUG

    const duplicate = await RepositoryItem.findDuplicate({
      title: req.body.title,
      doi: req.body.doi,
      handle: req.body.handle,
    });

    if (duplicate.rows.length > 0) {
      return res.status(409).json({
        message: "Repository item already exists",
        existing_item: duplicate.rows[0],
      });
    }

    // ✅ FIXED PATH
    let filePath = null;

    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;
    }

    const data = {
      title: req.body.title,
      abstract: req.body.abstract ?? null,
      item_type: req.body.item_type,
      language: req.body.language,
      doi: req.body.doi ?? null,
      handle: req.body.handle ?? null,
      access_level: req.body.access_level,
      status: req.body.status || "draft",
      embargo_until: req.body.embargo_until || null,
      file_path: filePath,
    };

    console.log("FINAL FILE PATH:", filePath); // 🔥 DEBUG

    const result = await RepositoryItem.create(data, req.user.uuid);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create item error:", err);
    res.status(500).json({ message: "Failed to create repository item" });
  }
};

/* ===============================
   BASIC CRUD
=============================== */
export const getItems = async (_, res) => {
  const result = await RepositoryItem.findAll();
  res.json(result.rows);
};

export const getItem = async (req, res) => {
  try {
    const { uuid } = req.params;

    // ✅ PREVENT CRASH
    if (!isUUID(uuid)) {
      return res.status(400).json({ message: "Invalid UUID" });
    }

    const result = await RepositoryItem.findById(uuid);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateItem = async (req, res) => {
  let filePath = req.body.existing_file_path || null;

  if (req.file) {
    filePath = `/uploads/repository/items/${req.file.filename}`;
    if (req.body.existing_file_path) {
      const oldPath = path.join(process.cwd(), "public", req.body.existing_file_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
  }

  const result = await RepositoryItem.update(req.params.uuid, {
    ...req.body,
    embargo_until: req.body.embargo_until || null,
    file_path: filePath,
  });

  res.json(result.rows[0]);
};

/* ===============================
   AUTHOR - MY ITEMS
=============================== */
export const getMyItems = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM repository_items 
       WHERE submitter_id = $1 
       ORDER BY created_at DESC`,
      [req.user.uuid]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get my items error:", error);
    res.status(500).json({ message: "Failed to fetch user items" });
  }
};

export const deleteItem = async (req, res) => {
  const item = await RepositoryItem.findById(req.params.uuid);
  if (item.rows[0]?.file_path) {
    const filePath = path.join(process.cwd(), "public", item.rows[0].file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await RepositoryItem.delete(req.params.uuid);
  res.json({ message: "Deleted" });
};

/* ===============================
   STATUS FLOWS
=============================== */
export const submitDraftItem = async (req, res) => {
  const result = await RepositoryItem.updateStatus(req.params.uuid, "submitted");
  res.json(result.rows[0]);
};

export const approveRepositoryItem = async (req, res) => {
  const result = await RepositoryItem.updateStatus(req.params.uuid, "approved");
  res.json(result.rows[0]);
};

export const rejectRepositoryItem = async (req, res) => {
  const result = await RepositoryItem.updateStatus(
    req.params.uuid,
    "rejected",
    req.body.reason
  );
  res.json(result.rows[0]);
};

export const requestRevision = async (req, res) => {
  const result = await RepositoryItem.updateStatus(
    req.params.uuid,
    "revision_required",
    null,
    req.body.comment
  );
  res.json(result.rows[0]);
};

/* ===============================
   QUEUES
=============================== */
export const getCuratorNewQueue = async (_, res) => {
  const result = await RepositoryItem.findByStatus("submitted");
  res.json(result.rows);
};

/* ---------- REVIEWER QUEUE ---------- */
export const getReviewerNewQueue = async (req, res) => {
  try {
    const result = await RepositoryItem.getReviewerNewQueue();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load reviewer queue" });
  }
};
export const getReviewerItemDetail = async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await RepositoryItem.findByUUID(uuid);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Reviewer detail error:", error);
    res.status(500).json({ message: "Failed to load item detail" });
  }
};

/* ---------- CLAIM ---------- */
export const claimItem = async (req, res) => {
  try {
    const result = await RepositoryItem.claim(
      req.params.uuid,
      req.user.uuid
    );

    if (!result.rowCount) {
      return res.status(400).json({ message: "Item already claimed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Claim failed" });
  }
};

/* ---------- BULK CLAIM ---------- */
export const bulkClaimItems = async (req, res) => {
  try {
    const result = await RepositoryItem.bulkClaim(
      req.body.ids,
      req.user.uuid
    );

    res.json({ claimed: result.rows.map(r => r.uuid) });
  } catch (err) {
    res.status(500).json({ message: "Bulk claim failed" });
  }
};




/* ===============================
   AUTHOR VIEWS
=============================== */
export const getAuthorDrafts = async (req, res) => {
  const result = await RepositoryItem.findByStatusAndUser("draft", req.user.uuid);
  res.json(result.rows);
};

export const getAuthorDepositsUnderReview = async (req, res) => {
  const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
    "submitted",
    "under_review",
  ]);
  res.json(result.rows);
};

export const getReturnedDeposits = async (req, res) => {
  const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
    "revision_required",
  ]);
  res.json(result.rows);
};

export const getApprovedDeposits = async (req, res) => {
  const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
    "approved",
  ]);
  res.json(result.rows);
};

/* ===============================
   SEARCH
=============================== */
/* ---------- SEARCH ---------- */
export const searchRepositoryItems = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const data = await RepositoryItem.search(
    req.query.query ?? "",
    limit,
    offset
  );

  const count = await RepositoryItem.countSearch(req.query.query ?? "");

  res.json({
    data: data.rows,
    total: Number(count.rows[0].count),
    page
  });
};
export const suggestMetadata = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { suggested_title, suggested_abstract, keywords } = req.body;

    const result = await RepositoryItem.updateMetadata(uuid, {
      suggested_title,
      suggested_abstract,
      keywords,
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Suggest metadata error:", error);
    res.status(500).json({ message: "Failed to suggest metadata" });
  }
};
/* ===============================
   NLP / ANALYSIS
=============================== */
export const analyzeVocabulary = async (req, res) => {
  const item = await RepositoryItem.findById(req.params.uuid);
  if (!item.rows.length) return res.status(404).json({ message: "Not found" });

  const tokens = new natural.WordTokenizer()
    .tokenize(item.rows[0].abstract?.toLowerCase() || "");

  const filtered = sw.removeStopwords(tokens);
  const freq = {};
  filtered.forEach(w => (freq[w] = (freq[w] || 0) + 1));

  res.json(freq);
};

export const checkCopyright = async (req, res) => {
  const item = await RepositoryItem.findById(req.params.uuid);
  const all = await RepositoryItem.findAll();

  let max = 0;
  all.rows.forEach(i => {
    if (i.uuid !== req.params.uuid) {
      max = Math.max(
        max,
        stringSimilarity.compareTwoStrings(
          item.rows[0].abstract || "",
          i.abstract || ""
        )
      );
    }
  });

  res.json({ similarity_score: max });
};

/* ===============================
   DASHBOARD STATS
=============================== */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.uuid;

    const statsResult = await pool.query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'draft') AS draft,
        COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
        COUNT(*) FILTER (WHERE status = 'under_review') AS under_review,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
        COUNT(*) FILTER (WHERE status = 'revision_required') AS revision_required
      FROM repository_items
      WHERE submitter_id = $1
    `, [userId]);

    // OPTIONAL: trends (mock or real)
    const trendsResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COUNT(*) FILTER (WHERE status = 'submitted') AS submitted,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected') AS rejected
      FROM repository_items
      WHERE submitter_id = $1
      GROUP BY month
      ORDER BY MIN(created_at)
    `, [userId]);

    res.json({
      stats: statsResult.rows[0],
      trends: trendsResult.rows
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};


export const updateRevisionComment = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { curator_comment, title, abstract, item_type, language, access_level } = req.body;
    const userId = req.user.uuid;

    if (!curator_comment || !curator_comment.trim()) {
      return res.status(400).json({ message: "Revision comment is required" });
    }

    // Check status
    const statusCheck = await RepositoryItem.getStatusByUUID(uuid);
    if (!statusCheck.rows.length)
      return res.status(404).json({ message: "Item not found" });

    if (statusCheck.rows[0].status !== "revision_required") {
      return res.status(400).json({ message: "Only revision_required items can be edited" });
    }

    // Handle file upload
    let filePath = statusCheck.rows[0].file_path;
    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;

      // Delete old file
      if (statusCheck.rows[0].file_path) {
        const oldPath = path.join(process.cwd(), "public", statusCheck.rows[0].file_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // Validate required fields for NOT NULL columns
    const safeTitle = title?.trim() || statusCheck.rows[0].title || "Untitled";
    const safeType = item_type?.trim() || statusCheck.rows[0].item_type || "Unknown";

    const result = await RepositoryItem.update(uuid, {
      title: safeTitle,
      abstract: abstract ?? statusCheck.rows[0].abstract ?? "",
      item_type: safeType,
      language: language ?? statusCheck.rows[0].language ?? "English",
      access_level: access_level ?? statusCheck.rows[0].access_level ?? "public",
      status: statusCheck.rows[0].status,
      embargo_until: statusCheck.rows[0].embargo_until,
      file_path: filePath,
      correction_note: curator_comment,
      updated_by: userId,
      updated_at: new Date(),
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update revision with file error:", error);
    res.status(500).json({ message: "Failed to update revision", error: error.message });
  }
};
