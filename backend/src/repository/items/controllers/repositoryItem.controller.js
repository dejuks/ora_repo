import { RepositoryItem } from "../models/repositoryItem.model.js";
import path from "path";
import fs from "fs";
import sw from "stopword";
import stringSimilarity from "string-similarity";
import multer from "multer";

const tokens = {
  tokenize: (text = "") =>
    String(text)
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean),
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/repository/items");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

/* ===============================
   CREATE ITEM
=============================== */
export const createItem = async (req, res) => {
  try {
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

    const filePath = req.file
      ? `/uploads/repository/items/${req.file.filename}`
      : null;

    const data = {
      title: req.body.title,
      abstract: req.body.abstract ?? null,
      item_type: req.body.item_type,
      language: req.body.language,
      doi: req.body.doi ?? null,
      handle: req.body.handle ?? null,
      access_level: req.body.access_level,
      status: "draft",
      embargo_until: req.body.embargo_until || null,
      file_path: filePath,
    };

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
  try {
    const result = await RepositoryItem.findAll();
    res.json(result.rows);
  } catch (err) {
    console.error("Get items error:", err);
    res.status(500).json({ message: "Failed to fetch repository items" });
  }
};

export const getItem = async (req, res) => {
  try {
    const result = await RepositoryItem.findById(req.params.uuid);
    if (!result.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get item error:", err);
    res.status(500).json({ message: "Failed to fetch repository item" });
  }
};

export const updateItem = async (req, res) => {
  try {
    let filePath = req.body.existing_file_path || null;

    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;
      if (req.body.existing_file_path) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          req.body.existing_file_path,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const result = await RepositoryItem.update(req.params.uuid, {
      ...req.body,
      embargo_until: req.body.embargo_until || null,
      file_path: filePath,
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ message: "Failed to update repository item" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await RepositoryItem.findById(req.params.uuid);
    if (item.rows[0]?.file_path) {
      const filePath = path.join(
        process.cwd(),
        "public",
        item.rows[0].file_path,
      );
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await RepositoryItem.delete(req.params.uuid);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ message: "Failed to delete repository item" });
  }
};

/* ===============================
   STATUS FLOWS
=============================== */
export const submitDraftItem = async (req, res) => {
  try {
    const result = await RepositoryItem.updateStatus(req.params.uuid, "submitted");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Submit draft error:", err);
    res.status(500).json({ message: "Failed to submit repository item" });
  }
};

export const approveRepositoryItem = async (req, res) => {
  try {
    const result = await RepositoryItem.updateStatus(req.params.uuid, "approved");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Approve item error:", err);
    res.status(500).json({ message: "Failed to approve repository item" });
  }
};

export const rejectRepositoryItem = async (req, res) => {
  try {
    const result = await RepositoryItem.updateStatus(
      req.params.uuid,
      "rejected",
      req.body.reason,
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Reject item error:", err);
    res.status(500).json({ message: "Failed to reject repository item" });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const result = await RepositoryItem.updateStatus(
      req.params.uuid,
      "revision_required",
      null,
      req.body.comment,
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Request revision error:", err);
    res.status(500).json({ message: "Failed to request revision" });
  }
};

/* ===============================
   QUEUES
=============================== */
export const getCuratorNewQueue = async (_, res) => {
  try {
    const result = await RepositoryItem.findByStatus("submitted");
    res.json(result.rows);
  } catch (err) {
    console.error("Curator queue error:", err);
    res.status(500).json({ message: "Failed to load curator queue" });
  }
};

/* ---------- REVIEWER QUEUE ---------- */
export const getReviewerNewQueue = async (req, res) => {
  try {
    const result = await RepositoryItem.getReviewerNewQueue();
    res.json(result.rows);
  } catch (err) {
    console.error("Reviewer queue error:", err);
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
    const result = await RepositoryItem.claim(req.params.uuid, req.user.uuid);

    if (!result.rowCount) {
      return res.status(400).json({ message: "Item already claimed" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Claim item error:", err);
    res.status(500).json({ message: "Claim failed" });
  }
};

/* ---------- BULK CLAIM ---------- */
export const bulkClaimItems = async (req, res) => {
  try {
    const result = await RepositoryItem.bulkClaim(req.body.ids, req.user.uuid);

    res.json({ claimed: result.rows.map((r) => r.uuid) });
  } catch (err) {
    console.error("Bulk claim error:", err);
    res.status(500).json({ message: "Bulk claim failed" });
  }
};

/* ===============================
   AUTHOR VIEWS
=============================== */
export const getAuthorDrafts = async (req, res) => {
  try {
    const result = await RepositoryItem.findByStatusAndUser("draft", req.user.uuid);
    res.json(result.rows);
  } catch (err) {
    console.error("Get author drafts error:", err);
    res.status(500).json({ message: "Failed to fetch author drafts" });
  }
};

export const getAuthorDepositsUnderReview = async (req, res) => {
  try {
    const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
      "submitted",
      "under_review",
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Get deposits under review error:", err);
    res.status(500).json({ message: "Failed to fetch deposits under review" });
  }
};

export const getReturnedDeposits = async (req, res) => {
  try {
    const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
      "revision_required",
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Get returned deposits error:", err);
    res.status(500).json({ message: "Failed to fetch returned deposits" });
  }
};

export const getApprovedDeposits = async (req, res) => {
  try {
    const result = await RepositoryItem.findByAuthorAndStatuses(req.user.uuid, [
      "approved",
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error("Get approved deposits error:", err);
    res.status(500).json({ message: "Failed to fetch approved deposits" });
  }
};

/* ===============================
   SEARCH
=============================== */
export const searchRepositoryItems = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const data = await RepositoryItem.search(
      req.query.query ?? "",
      limit,
      offset,
    );

    const count = await RepositoryItem.countSearch(req.query.query ?? "");

    res.json({
      data: data.rows,
      total: Number(count.rows[0].count),
      page,
    });
  } catch (err) {
    console.error("Search repository items error:", err);
    res.status(500).json({ message: "Failed to search repository items" });
  }
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
  try {
    const item = await RepositoryItem.findById(req.params.uuid);

    if (!item.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const text = `${item.rows[0].title || ""} ${item.rows[0].abstract || ""}`;

    const rawTokens = tokens.tokenize(text);
    const filteredTokens = sw.removeStopwords(rawTokens);
    const frequency = {};

    for (const word of filteredTokens) {
      frequency[word] = (frequency[word] || 0) + 1;
    }

    const sorted = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));

    res.json({
      uuid: req.params.uuid,
      total_tokens: rawTokens.length,
      filtered_tokens: filteredTokens.length,
      vocabulary: sorted,
    });
  } catch (error) {
    console.error("Analyze vocabulary error:", error);
    res.status(500).json({ message: "Failed to analyze vocabulary" });
  }
};

export const checkCopyright = async (req, res) => {
  try {
    const item = await RepositoryItem.findById(req.params.uuid);

    if (!item.rows.length) {
      return res.status(404).json({ message: "Not found" });
    }

    const all = await RepositoryItem.findAll();

    let max = 0;
    let closestMatch = null;

    all.rows.forEach((i) => {
      if (i.uuid !== req.params.uuid) {
        const score = stringSimilarity.compareTwoStrings(
          item.rows[0].abstract || "",
          i.abstract || "",
        );

        if (score > max) {
          max = score;
          closestMatch = {
            uuid: i.uuid,
            title: i.title,
            similarity_score: score,
          };
        }
      }
    });

    res.json({
      similarity_score: max,
      closest_match: closestMatch,
    });
  } catch (error) {
    console.error("Check copyright error:", error);
    res.status(500).json({ message: "Failed to check copyright" });
  }
};

export const updateRevisionComment = async (req, res) => {
  try {
    const { uuid } = req.params;
    const {
      curator_comment,
      title,
      abstract,
      item_type,
      language,
      access_level,
    } = req.body;
    const userId = req.user.uuid;

    if (!curator_comment || !curator_comment.trim()) {
      return res.status(400).json({ message: "Revision comment is required" });
    }

    const statusCheck = await RepositoryItem.getStatusByUUID(uuid);
    if (!statusCheck.rows.length) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (statusCheck.rows[0].status !== "revision_required") {
      return res
        .status(400)
        .json({ message: "Only revision_required items can be edited" });
    }

    let filePath = statusCheck.rows[0].file_path;
    if (req.file) {
      filePath = `/uploads/repository/items/${req.file.filename}`;

      if (statusCheck.rows[0].file_path) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          statusCheck.rows[0].file_path,
        );
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const safeTitle = title?.trim() || statusCheck.rows[0].title || "Untitled";
    const safeType =
      item_type?.trim() || statusCheck.rows[0].item_type || "Unknown";

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
    res
      .status(500)
      .json({ message: "Failed to update revision", error: error.message });
  }
};