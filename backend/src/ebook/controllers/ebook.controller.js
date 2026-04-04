import { createCrudController } from "./createCrudController.js";
import { EbookSubmissionModel } from "../models/ebookSubmission.model.js";
import { EbookReviewAssignmentModel } from "../models/ebookReviewAssignment.model.js";
import { EbookReviewModel } from "../models/ebookReview.model.js";
import { EbookFinanceModel } from "../models/ebookFinance.model.js";
import { EbookProductionModel } from "../models/ebookProduction.model.js";
import { EbookPublicationModel } from "../models/ebookPublication.model.js";
import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";

import pool from "../../config/db.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const submissionCrud = createCrudController(EbookSubmissionModel, "ebook submission");
const assignmentCrud = createCrudController(
  EbookReviewAssignmentModel,
  "ebook review assignment"
);
const reviewCrud = createCrudController(EbookReviewModel, "ebook review");
const financeCrud = createCrudController(EbookFinanceModel, "ebook finance");
const productionCrud = createCrudController(EbookProductionModel, "ebook production");
const publicationCrud = createCrudController(EbookPublicationModel, "ebook publication");

export const ebookSubmissionController = {
  ...submissionCrud,

  index: asyncHandler(async (req, res) => {
    const limit = Math.max(1, Math.min(Number(req.query?.limit || 100), 500));
    const search = (req.query?.search || "").trim();
    const values = [];
    const where = [];

    if (search) {
      values.push(`%${search}%`);
      const idx = values.length;
      where.push(
        `(es.title ILIKE $${idx} OR es.subtitle ILIKE $${idx} OR es.abstract ILIKE $${idx} OR array_to_string(es.keywords, ',') ILIKE $${idx})`
      );
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT es.*, u.full_name AS author_name,
              COUNT(esf.file_id)::int AS file_count,
              MAX(esf.created_at) AS latest_file_at,
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT esf.file_role), NULL) AS file_roles,
              (ARRAY_REMOVE(ARRAY_AGG(esf.original_name ORDER BY esf.created_at DESC), NULL))[1] AS latest_file_name
       FROM ebook_submissions es
       LEFT JOIN users u ON u.uuid = es.author_id
       LEFT JOIN ebook_submission_files esf
         ON esf.submission_id = es.submission_id
        AND esf.is_active = TRUE
       ${whereSql}
       GROUP BY es.submission_id, u.full_name
       ORDER BY COALESCE(es.updated_at, es.created_at) DESC
       LIMIT $${values.length + 1}`,
      [...values, limit]
    );

    res.json({ rows: result.rows, meta: { limit, total: result.rows.length } });
  }),

  show: asyncHandler(async (req, res) => {
    const row = await pool.query(
      `SELECT es.*, u.full_name AS author_name,
              COUNT(esf.file_id)::int AS file_count,
              ARRAY_REMOVE(ARRAY_AGG(DISTINCT esf.file_role), NULL) AS file_roles,
              JSONB_AGG(
                DISTINCT JSONB_BUILD_OBJECT(
                  'file_id', esf.file_id,
                  'file_role', esf.file_role,
                  'original_name', esf.original_name,
                  'file_path', esf.file_path,
                  'created_at', esf.created_at
                )
              ) FILTER (WHERE esf.file_id IS NOT NULL) AS files
       FROM ebook_submissions es
       LEFT JOIN users u ON u.uuid = es.author_id
       LEFT JOIN ebook_submission_files esf
         ON esf.submission_id = es.submission_id
        AND esf.is_active = TRUE
       WHERE es.submission_id = $1
       GROUP BY es.submission_id, u.full_name`,
      [req.params.id]
    );

    if (!row.rows[0]) {
      const error = new Error("ebook submission not found");
      error.status = 404;
      throw error;
    }

    res.json(row.rows[0]);
  }),

  store: asyncHandler(async (req, res) => {
    const payload = {
      ...req.body,
      author_id: req.body.author_id || req.user?.uuid || null,
      publication_year: req.body.publication_year
        ? Number(req.body.publication_year)
        : null,
      bpc_amount:
        req.body.bpc_amount !== undefined &&
        req.body.bpc_amount !== null &&
        req.body.bpc_amount !== ""
          ? Number(req.body.bpc_amount)
          : 0,
      requires_bpc:
        req.body.requires_bpc === true ||
        req.body.requires_bpc === "true" ||
        req.body.requires_bpc === "1" ||
        req.body.requires_bpc === 1,
      keywords: Array.isArray(req.body.keywords)
        ? req.body.keywords
        : typeof req.body.keywords === "string"
        ? req.body.keywords
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    const row = await ebookWorkflowService.createSubmission(
      payload,
      req.user?.uuid,
      req.file,
      req.body.file_role || "manuscript"
    );

    res.status(201).json(row);
  }),

  authorDashboard: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.authorDashboard(req.user?.uuid));
  }),

  editorDashboard: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.editorDashboard(req.user?.uuid));
  }),

  reviewerDashboard: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.reviewerDashboard(req.user?.uuid));
  }),

  financeDashboard: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.financeDashboard());
  }),

  productionDashboard: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.productionDashboard());
  }),

  reviewerOptions: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.getReviewerOptions());
  }),

 workflow: asyncHandler(async (req, res) => {
  // The route parameter is 'uuid', not 'id'
  const submissionId = req.params.uuid || req.params.id;
  
  if (!submissionId) {
    const error = new Error("Submission ID is required");
    error.status = 400;
    throw error;
  }
  
  res.json(await ebookWorkflowService.getWorkflow(submissionId));
}),

  submit: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.submitManuscript(req.params.id, req.user?.uuid)
    );
  }),

  resubmit: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.resubmitManuscript(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  screening: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.editorScreening(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  assignReviewer: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.assignReviewer(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  reassignReviewer: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.reassignReviewer(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  assignPreviousReviewers: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.assignPreviousReviewersForRevision(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  editorialDecision: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.editorialDecision(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  upsertFinance: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.upsertFinance(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  upsertProduction: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.upsertProduction(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  publish: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.publishSubmission(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

  getEditorQueue: asyncHandler(async (req, res) => {
    const { stage, search, overdue_only } = req.query;

    let query = `
      SELECT 
        es.submission_id,
        es.title,
        es.subtitle,
        es.abstract,
        es.category,
        es.language,
        es.publication_year,
        es.target_audience,
        es.keywords,
        es.status,
        es.created_at,
        es.updated_at,
        es.submitted_at,
        es.accepted_at,
        u.uuid AS author_id,
        u.full_name AS author_name,
        u.email AS author_email,
        COUNT(DISTINCT era.assignment_id)::int AS assignment_count,
        COUNT(DISTINCT er.review_id)::int AS review_count,
        COUNT(
          DISTINCT CASE 
            WHEN era.status IN ('assigned', 'accepted')
             AND era.due_date < CURRENT_DATE
            THEN era.assignment_id
          END
        )::int AS overdue_assignment_count,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT u_rev.full_name), NULL) AS reviewer_names,
        ef.payment_status,
        ef.amount_due AS bpc_amount,
        ef.invoice_number,
        ef.receipt_number,
        ep.proof_sent_to_author,
        ep.author_proof_approved,
        ep.proof_sent_at,
        ep.completed_at AS proof_approved_at
      FROM ebook_submissions es
      LEFT JOIN users u ON u.uuid = es.author_id
      LEFT JOIN ebook_review_assignments era
        ON era.submission_id = es.submission_id
      LEFT JOIN ebook_reviews er
        ON er.assignment_id = era.assignment_id
      LEFT JOIN users u_rev
        ON u_rev.uuid = era.reviewer_id
      LEFT JOIN ebook_finance_clearances ef
        ON ef.submission_id = es.submission_id
      LEFT JOIN ebook_production ep
        ON ep.submission_id = es.submission_id
      WHERE 1 = 1
    `;

    const values = [];
    let paramCount = 1;

    if (stage === "screening") {
      query += ` AND es.status IN ('submitted')`;
    } else if (stage === "screened") {
      query += ` AND es.status IN ('editor_screening')`;
    } else if (
      stage === "reviews" ||
      stage === "review" ||
      stage === "under_review"
    ) {
      query += ` AND es.status IN ('under_review')`;
    } else if (
      stage === "handoff" ||
      stage === "decision" ||
      stage === "decisions"
    ) {
      query += ` AND es.status IN ('accepted', 'finance_cleared', 'in_production', 'published')`;
    }

    if (search && search.trim()) {
      query += ` AND (
        es.title ILIKE $${paramCount}
        OR es.abstract ILIKE $${paramCount}
        OR u.full_name ILIKE $${paramCount}
      )`;
      values.push(`%${search.trim()}%`);
      paramCount++;
    }

    if (String(overdue_only) === "true") {
      query += ` AND EXISTS (
        SELECT 1
        FROM ebook_review_assignments era2
        WHERE era2.submission_id = es.submission_id
          AND era2.status IN ('assigned', 'accepted')
          AND era2.due_date < CURRENT_DATE
      )`;
    }

    query += `
      GROUP BY
        es.submission_id,
        u.uuid,
        u.full_name,
        u.email,
        ef.finance_id,
        ep.production_id
      ORDER BY COALESCE(es.updated_at, es.created_at) DESC
    `;

    const result = await pool.query(query, values);
    res.json({ rows: result.rows });
  }),
};

export const ebookReviewAssignmentController = {
  ...assignmentCrud,

  index: asyncHandler(async (req, res) => {
    const values = [];
    const where = [];

    if (req.query?.submission_id) {
      values.push(req.query.submission_id);
      where.push(`era.submission_id = $${values.length}`);
    }

    if (req.query?.reviewer_id) {
      values.push(req.query.reviewer_id);
      where.push(`era.reviewer_id = $${values.length}`);
    }

    if (req.query?.status) {
      values.push(req.query.status);
      where.push(`era.status = $${values.length}`);
    }

    if (req.query?.round_no) {
      values.push(Number(req.query.round_no));
      where.push(`era.round_no = $${values.length}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `SELECT era.*, es.title, es.status AS submission_status,
              u.full_name AS reviewer_name, u.email AS reviewer_email,
              a.full_name AS author_name
       FROM ebook_review_assignments era
       INNER JOIN ebook_submissions es
         ON es.submission_id = era.submission_id
       LEFT JOIN users u
         ON u.uuid = era.reviewer_id
       LEFT JOIN users a
         ON a.uuid = es.author_id
       ${whereSql}
       ORDER BY era.round_no DESC, era.assigned_at DESC`,
      values
    );

    res.json({ rows });
  }),

  respond: asyncHandler(async (req, res) => {
    res.json(
      await ebookWorkflowService.respondReviewAssignment(
        req.params.id,
        req.user?.uuid,
        req.body || {}
      )
    );
  }),

submitReview: asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    originality_score:
      req.body?.originality_score !== undefined &&
      req.body?.originality_score !== null &&
      req.body?.originality_score !== ""
        ? Number(req.body.originality_score)
        : null,
    quality_score:
      req.body?.quality_score !== undefined &&
      req.body?.quality_score !== null &&
      req.body?.quality_score !== ""
        ? Number(req.body.quality_score)
        : null,
    relevance_score:
      req.body?.relevance_score !== undefined &&
      req.body?.relevance_score !== null &&
      req.body?.relevance_score !== ""
        ? Number(req.body.relevance_score)
        : null,
    recommendation:
      req.body?.recommendation ??
      req.body?.review_recommendation ??
      req.body?.decision ??
      null,
    comments_for_author:
      typeof req.body?.comments_for_author === "string"
        ? req.body.comments_for_author.trim()
        : req.body?.comments_for_author || "",
    confidential_comments:
      typeof req.body?.confidential_comments === "string"
        ? req.body.confidential_comments.trim()
        : req.body?.confidential_comments || "",
  };

  res.json(
    await ebookWorkflowService.submitReview(
      req.params.id,
      req.user?.uuid,
      payload
    )
  );
}),
};

export const ebookReviewController = reviewCrud;
export const ebookFinanceController = financeCrud;
export const ebookProductionController = productionCrud;

export const ebookPublicationController = {
  ...publicationCrud,

  publicCatalog: asyncHandler(async (req, res) => {
    res.json(await ebookWorkflowService.publicCatalog(req.query || {}));
  }),

  publicDetail: asyncHandler(async (req, res) => {
    const catalog = await ebookWorkflowService.publicCatalog({
      search: req.params.slug,
      limit: 1,
    });

    const row =
      catalog.rows.find((item) => item.slug === req.params.slug) || null;

    if (!row) {
      const error = new Error("Publication not found");
      error.status = 404;
      throw error;
    }

    await ebookWorkflowService.logPublicAccess(row.publication_id, {
      event_type: "view",
      ip_address: req.ip,
      user_agent: req.get("user-agent"),
      actor_id: req.user?.uuid || null,
    });

    res.json(row);
  }),
};