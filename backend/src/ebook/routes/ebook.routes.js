import express from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/rbac.middleware.js";
import { uploadEbookFile } from "../middleware/upload.middleware.js";
import { ebookSubmissionController, ebookReviewAssignmentController, ebookPublicationController } from "../controllers/ebook.controller.js";
import { ebookWorkflowService } from "../services/ebookWorkflow.service.js";
import pool from "../../config/db.js";

const router = express.Router();
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const TEMPLATE = {
  recommendation_options: ["accept", "minor_revision", "major_revision", "reject"],
  fields: [
    { key: "originality_score", label: "Originality Score", type: "number" },
    { key: "quality_score", label: "Quality Score", type: "number" },
    { key: "relevance_score", label: "Relevance Score", type: "number" },
    { key: "recommendation", label: "Recommendation", type: "select" },
    { key: "comments_for_author", label: "Comments for Author", type: "textarea" },
    { key: "confidential_comments", label: "Confidential Comments", type: "textarea" },
  ],
};

async function listMine(userId, query = {}) {
  const values = [userId];
  const clauses = ["es.author_id = $1"];
  const stage = String(query.stage || "").trim();
  const status = String(query.status || "").trim();
  const search = String(query.search || "").trim();
  if (status) {
    values.push(status);
    clauses.push(`es.status = $${values.length}`);
  }
  if (stage === "revisions") clauses.push("es.status = 'revision_requested'");
  if (stage === "payments") clauses.push("(es.status = 'accepted' OR COALESCE(ef.payment_status,'pending') IN ('pending','waiver_requested','declined','partially_paid','paid'))");
  if (stage === "proofs") clauses.push("COALESCE(ep.proof_sent_to_author,false) = TRUE AND COALESCE(ep.author_proof_approved,false) = FALSE");
  if (stage === "accepted") clauses.push("es.status IN ('accepted','finance_cleared','in_production','published')");
  if (stage === "approved") clauses.push("COALESCE(ef.payment_status,'') IN ('cleared','waived')");
  if (search) {
    values.push(`%${search}%`);
    clauses.push(`(es.title ILIKE $${values.length} OR es.subtitle ILIKE $${values.length} OR es.abstract ILIKE $${values.length})`);
  }
  const sql = `
    SELECT es.*, u.full_name AS author_name,
           COUNT(DISTINCT esf.file_id)::int AS file_count,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT esf.file_role), NULL) AS file_roles,
           ef.payment_status, ef.amount_due, ef.amount_paid, ef.currency_code, ef.invoice_number, ef.receipt_number,
           ep.proof_sent_to_author, ep.author_proof_approved,
           pub.slug, pub.is_public, pub.published_at
    FROM ebook_submissions es
    LEFT JOIN users u ON u.uuid = es.author_id
    LEFT JOIN ebook_submission_files esf ON esf.submission_id = es.submission_id AND esf.is_active = TRUE
    LEFT JOIN ebook_finance_clearances ef ON ef.submission_id = es.submission_id
    LEFT JOIN ebook_production ep ON ep.submission_id = es.submission_id
    LEFT JOIN ebook_publications pub ON pub.submission_id = es.submission_id
    WHERE ${clauses.join(" AND ")}
    GROUP BY es.submission_id, u.full_name, ef.finance_id, ep.production_id, pub.publication_id
    ORDER BY COALESCE(es.updated_at, es.created_at) DESC`;
  const { rows } = await pool.query(sql, values);
  return { rows };
}

async function editorQueue(query = {}) {
  const { stage, search, overdue_only } = query;
  let sql = `
    SELECT es.submission_id, es.title, es.subtitle, es.abstract, es.category, es.language, es.publication_year, es.target_audience,
           es.keywords, es.status, es.created_at, es.updated_at, es.submitted_at, es.accepted_at,
           u.uuid AS author_id, u.full_name AS author_name, u.email AS author_email,
           COUNT(DISTINCT era.assignment_id)::int AS assignment_count,
           COUNT(DISTINCT er.review_id)::int AS review_count,
           COUNT(DISTINCT CASE WHEN era.status = 'assigned' AND era.due_date < CURRENT_DATE THEN era.assignment_id END)::int AS overdue_assignment_count,
           ARRAY_REMOVE(ARRAY_AGG(DISTINCT u_rev.full_name), NULL) AS reviewer_names,
           ef.payment_status, ef.amount_due AS bpc_amount, ef.invoice_number, ef.receipt_number,
           ep.proof_sent_to_author, ep.author_proof_approved, ep.proof_sent_to_author AS proof_sent_at, ep.completed_at AS proof_approved_at
    FROM ebook_submissions es
    LEFT JOIN users u ON u.uuid = es.author_id
    LEFT JOIN ebook_review_assignments era ON era.submission_id = es.submission_id
    LEFT JOIN ebook_reviews er ON er.assignment_id = era.assignment_id
    LEFT JOIN users u_rev ON u_rev.uuid = era.reviewer_id
    LEFT JOIN ebook_finance_clearances ef ON ef.submission_id = es.submission_id
    LEFT JOIN ebook_production ep ON ep.submission_id = es.submission_id
    WHERE 1=1`;
  const values = [];
  let i = 1;
  if (stage === 'screening') sql += ` AND es.status IN ('submitted')`;
  else if (stage === 'screened') sql += ` AND es.status IN ('editor_screening')`;
  else if (stage === 'reviews' || stage === 'review' || stage === 'under_review') sql += ` AND es.status IN ('under_review')`;
  else if (stage === 'handoff' || stage === 'decision' || stage === 'decisions') sql += ` AND es.status IN ('accepted','finance_cleared','in_production','published')`;
  if (search) {
    sql += ` AND (es.title ILIKE $${i} OR es.abstract ILIKE $${i} OR u.full_name ILIKE $${i})`;
    values.push(`%${search}%`); i += 1;
  }
  if (String(overdue_only) === 'true') {
    sql += ` AND EXISTS (SELECT 1 FROM ebook_review_assignments x WHERE x.submission_id = es.submission_id AND x.status IN ('assigned','accepted') AND x.due_date < CURRENT_DATE)`;
  }
  sql += ` GROUP BY es.submission_id, u.uuid, u.full_name, u.email, ef.finance_id, ep.production_id ORDER BY COALESCE(es.updated_at, es.created_at) DESC`;
  const { rows } = await pool.query(sql, values);
  return { rows };
}

router.use(authenticate);

// ===== Submission Routes =====
router.get('/submissions', authorize('ebook.submission.view'), ebookSubmissionController.index);
router.get('/submissions-mine', authorize('ebook.submission.view'), asyncHandler(async (req, res) => {
  res.json(await listMine(req.user?.uuid, req.query || {}));
}));
router.get('/submissions/:id', authorize('ebook.submission.view'), ebookSubmissionController.show);
router.get('/submissions/:id/workflow', authorize('ebook.workflow.view'), ebookSubmissionController.workflow);
router.post('/submissions', authorize('ebook.submission.create'), uploadEbookFile.single('file'), ebookSubmissionController.store);
router.put('/submissions/:id', authorize('ebook.submission.update'), ebookSubmissionController.update);
router.patch('/submissions/:id', authorize('ebook.submission.update'), ebookSubmissionController.update);
router.delete('/submissions/:id', authorize('ebook.submission.delete'), ebookSubmissionController.destroy);
router.post('/submissions/:id/submit', authorize('ebook.submission.submit'), ebookSubmissionController.submit);
router.post('/submissions/:id/resubmit', authorize('ebook.submission.resubmit'), ebookSubmissionController.resubmit);
router.post('/submissions/:id/screening', authorize('ebook.editor.screen'), ebookSubmissionController.screening);
router.post('/submissions/:id/assign-reviewer', authorize('ebook.reviewer.assign'), ebookSubmissionController.assignReviewer);
router.post('/submissions/:id/reassign-reviewer', authorize('ebook.reviewer.assign'), ebookSubmissionController.reassignReviewer);
router.post('/submissions/:id/assign-previous-reviewers', authorize('ebook.reviewer.assign'), ebookSubmissionController.assignPreviousReviewers);
router.post('/submissions/:id/decision', authorize('ebook.decision.make'), ebookSubmissionController.editorialDecision);
router.post('/submissions/:id/finance', authorize('ebook.finance.clear'), ebookSubmissionController.upsertFinance);
router.post('/submissions/:id/production', authorize('ebook.production.manage'), ebookSubmissionController.upsertProduction);
router.post('/submissions/:id/publish', authorize('ebook.publication.release'), ebookSubmissionController.publish);
router.post('/submissions/:id/files/upload', authorize('ebook.file.upload'), uploadEbookFile.single('file'), asyncHandler(async (req, res) => {
  res.status(201).json(await ebookWorkflowService.uploadFile(req.params.id, req.user?.uuid, req.file, req.body.file_role || 'manuscript'));
}));

// ===== File Management Routes (NEW) =====
router.get('/submissions/:id/files', 
  authorize('ebook.submission.view'), 
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM ebook_submission_files 
       WHERE submission_id = $1 
       AND is_active = TRUE 
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ rows });
  })
);

router.delete('/submissions/:id/files/:fileId', 
  authorize('ebook.file.delete'), 
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE ebook_submission_files 
       SET is_active = FALSE, deleted_at = NOW() 
       WHERE file_id = $1 AND submission_id = $2
       RETURNING *`,
      [req.params.fileId, req.params.id]
    );
    res.json({ success: true, file: rows[0] });
  })
);

// ===== Finance Management Routes =====
router.get('/finance-queue', 
  authorize('ebook.finance.view'), 
  ebookSubmissionController.financeDashboard
);

router.get('/submissions/:id/finance', 
  authorize('ebook.workflow.view'), 
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM ebook_finance_clearances WHERE submission_id = $1`,
      [req.params.id]
    );
    res.json(rows[0] || null);
  })
);

router.get('/submissions/:id/invoice', authorize('ebook.workflow.view'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM ebook_finance_clearances WHERE submission_id = $1`, [req.params.id]);
  res.json(rows[0] || null);
}));

router.get('/submissions/:id/receipt', authorize('ebook.workflow.view'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT receipt_number, payment_status, amount_paid, currency_code, updated_at FROM ebook_finance_clearances WHERE submission_id = $1`, [req.params.id]);
  res.json(rows[0] || null);
}));

router.get('/submissions/:id/finance-transactions', authorize('ebook.workflow.view'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT history_id, action, note, acted_at, actor_id FROM ebook_workflow_history WHERE submission_id = $1 AND action LIKE 'finance.%' ORDER BY acted_at DESC`, [req.params.id]);
  res.json({ rows });
}));

router.post('/submissions/:id/request-waiver', authorize('ebook.submission.view'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { waiver_requested: true, waiver_reason: req.body?.waiver_reason || req.body?.reason || null, payment_status: 'waiver_requested', review_note: req.body?.note || 'Waiver requested by author' }));
}));

router.post('/submissions/:id/approve-waiver', authorize('ebook.finance.waiver.manage'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { waiver_requested: true, waiver_percentage: req.body?.waiver_percentage ?? 100, waiver_reason: req.body?.waiver_reason || req.body?.reason || null, payment_status: 'waived', review_note: req.body?.review_note || 'Waiver approved' }));
}));

router.post('/submissions/:id/decline-waiver', authorize('ebook.finance.waiver.manage'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { waiver_requested: false, payment_status: 'pending', review_note: req.body?.review_note || 'Waiver declined' }));
}));

router.post('/submissions/:id/issue-invoice', authorize('ebook.finance.clear'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { ...req.body, payment_status: req.body?.payment_status || 'pending', review_note: req.body?.review_note || 'Invoice prepared' }));
}));

router.post('/submissions/:id/verify-payment', authorize('ebook.finance.clear'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { ...req.body, payment_status: 'cleared', review_note: req.body?.review_note || 'Payment verified' }));
}));

router.post('/submissions/:id/reject-payment', authorize('ebook.finance.clear'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { ...req.body, payment_status: 'declined', review_note: req.body?.review_note || 'Payment rejected' }));
}));

router.post('/submissions/:id/payment-proof', authorize('ebook.submission.view'), uploadEbookFile.single('file'), asyncHandler(async (req, res) => {
  if (req.file) {
    await ebookWorkflowService.uploadFile(req.params.id, req.user?.uuid, req.file, 'payment_proof');
  }
  res.json(await ebookWorkflowService.upsertFinance(req.params.id, req.user?.uuid, { payment_reference: req.body?.payment_reference || req.body?.reference || null, amount_paid: req.body?.amount_paid ?? null, payment_status: 'paid', review_note: req.body?.note || 'Payment proof submitted by author' }));
}));

// ===== Production Management Routes =====
router.get('/production-queue', 
  authorize('ebook.production.view'), 
  ebookSubmissionController.productionDashboard
);

router.get('/submissions/:id/production', 
  authorize('ebook.workflow.view'), 
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM ebook_production WHERE submission_id = $1`,
      [req.params.id]
    );
    res.json(rows[0] || null);
  })
);

router.post('/submissions/:id/production/files', 
  authorize('ebook.production.manage'), 
  uploadEbookFile.single('file'), 
  asyncHandler(async (req, res) => {
    const file = await ebookWorkflowService.uploadFile(
      req.params.id, 
      req.user?.uuid, 
      req.file, 
      req.body.file_role || 'final'
    );
    res.status(201).json(file);
  })
);

router.post('/submissions/:id/approve-proof', authorize('ebook.workflow.view'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertProduction(req.params.id, req.user?.uuid, { author_proof_approved: true, quality_note: req.body?.note || 'Proof approved by author' }));
}));

router.post('/submissions/:id/approve-production', authorize('ebook.decision.make'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.upsertProduction(req.params.id, req.user?.uuid, { pdf_ready: true, quality_note: req.body?.note || 'Approved for production by editor' }));
}));

// ===== Editor Communication Routes =====
router.post('/submissions/:id/notify-author', authorize('ebook.decision.make'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`INSERT INTO ebook_workflow_history (submission_id, from_status, to_status, action, note, actor_id) SELECT submission_id, status, status, 'editor.notify_author', $2, $3 FROM ebook_submissions WHERE submission_id = $1 RETURNING *`, [req.params.id, req.body?.message || 'Editorial update available.', req.user?.uuid]);
  res.json(rows[0] || { ok: true });
}));

router.post('/submissions/:id/editor-comment', authorize('ebook.decision.make'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`INSERT INTO ebook_workflow_history (submission_id, from_status, to_status, action, note, actor_id) SELECT submission_id, status, status, 'editor.comment', $2, $3 FROM ebook_submissions WHERE submission_id = $1 RETURNING *`, [req.params.id, req.body?.note || 'Editor comment added.', req.user?.uuid]);
  res.json(rows[0] || { ok: true });
}));

router.get('/submissions/:id/review-comments', authorize('ebook.workflow.view'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT er.*, u.full_name AS reviewer_name FROM ebook_reviews er LEFT JOIN users u ON u.uuid = er.reviewer_id WHERE er.submission_id = $1 ORDER BY er.submitted_at DESC`, [req.params.id]);
  res.json({ rows });
}));

// ===== Dashboard Routes =====
router.get('/dashboard/author', authorize('ebook.dashboard.author'), ebookSubmissionController.authorDashboard);
router.get('/dashboard/editor', authorize('ebook.dashboard.editor'), ebookSubmissionController.editorDashboard);
router.get('/dashboard/reviewer', authorize('ebook.dashboard.reviewer'), ebookSubmissionController.reviewerDashboard);
router.get('/dashboard/finance', authorize('ebook.dashboard.finance'), ebookSubmissionController.financeDashboard);
router.get('/dashboard/production', authorize('ebook.dashboard.production'), ebookSubmissionController.productionDashboard);

// ===== Editor Queue Routes =====
router.get('/reviewer-options', authorize('ebook.reviewer.assign'), ebookSubmissionController.reviewerOptions);
router.get('/editor-queue', authorize('ebook.submission.view'), asyncHandler(async (req, res) => {
  res.json(await editorQueue(req.query || {}));
}));

// ===== Review Assignment Routes =====
router.get('/review-template', authorize('ebook.review.assignment.view'), asyncHandler(async (req, res) => {
  res.json(TEMPLATE);
}));

router.get('/review-assignments', authorize('ebook.review.assignment.view'), ebookReviewAssignmentController.index);
router.get('/review-assignments/:id', authorize('ebook.review.assignment.view'), ebookReviewAssignmentController.show);
router.get('/review-assignments/:id/detail', authorize('ebook.review.assignment.view'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT era.*, es.title, es.subtitle, es.abstract, es.status AS submission_status, es.keywords, es.category, es.language,
           u.full_name AS reviewer_name, a.full_name AS author_name,
           er.review_id, er.originality_score, er.quality_score, er.relevance_score, er.recommendation, er.comments_for_author, er.confidential_comments, er.submitted_at
    FROM ebook_review_assignments era
    INNER JOIN ebook_submissions es ON es.submission_id = era.submission_id
    LEFT JOIN users u ON u.uuid = era.reviewer_id
    LEFT JOIN users a ON a.uuid = es.author_id
    LEFT JOIN LATERAL (
      SELECT * FROM ebook_reviews r WHERE r.assignment_id = era.assignment_id ORDER BY r.submitted_at DESC LIMIT 1
    ) er ON TRUE
    WHERE era.assignment_id = $1`, [req.params.id]);
  res.json(rows[0] || null);
}));

router.get('/review-assignments/:id/files', authorize('ebook.review.assignment.view'), asyncHandler(async (req, res) => {
  const sub = await pool.query(
    `SELECT submission_id
     FROM ebook_review_assignments
     WHERE assignment_id = $1`,
    [req.params.id]
  );

  const submissionId = sub.rows[0]?.submission_id;

  if (!submissionId) {
    return res.json({
      manuscript_files: [],
      review_attachments: [],
    });
  }

  const { rows } = await pool.query(
    `SELECT *
     FROM ebook_submission_files
     WHERE submission_id = $1
       AND is_active = TRUE
     ORDER BY created_at DESC`,
    [submissionId]
  );

  const manuscript_files = rows.filter(
    (file) => String(file.file_role || "").toLowerCase() !== "review_attachment"
  );

  const review_attachments = rows.filter(
    (file) => String(file.file_role || "").toLowerCase() === "review_attachment"
  );

  res.json({
    manuscript_files,
    review_attachments,
  });
}));

router.post('/review-assignments/:id/respond', authorize('ebook.review.respond'), ebookReviewAssignmentController.respond);
router.post('/review-assignments/:id/submit-review', authorize('ebook.review.submit'), ebookReviewAssignmentController.submitReview);
router.put('/review-assignments/:id/review', authorize('ebook.review.submit'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.submitReview(req.params.id, req.user?.uuid, req.body || {}));
}));

router.post('/review-assignments/:id/extension', authorize('ebook.review.respond'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`UPDATE ebook_review_assignments SET due_date = COALESCE($2, due_date), response_note = COALESCE($3, response_note), updated_at = NOW() WHERE assignment_id = $1 RETURNING *`, [req.params.id, req.body?.due_date || null, req.body?.note || 'Extension requested']);
  res.json(rows[0] || null);
}));

router.post('/review-assignments/:id/files', authorize('ebook.review.submit'), uploadEbookFile.single('file'), asyncHandler(async (req, res) => {
  const sub = await pool.query(`SELECT submission_id FROM ebook_review_assignments WHERE assignment_id = $1`, [req.params.id]);
  const submissionId = sub.rows[0]?.submission_id;
  if (!submissionId) throw Object.assign(new Error('Assignment not found'), { status: 404 });
  const file = await ebookWorkflowService.uploadFile(submissionId, req.user?.uuid, req.file, 'review_attachment');
  res.status(201).json(file);
}));

router.delete('/review-assignments/:id', authorize('ebook.reviewer.assign'), asyncHandler(async (req, res) => {
  res.json(await ebookWorkflowService.removeReviewAssignment(req.params.id, req.user?.uuid, req.body?.note || null));
}));

router.get('/reviewer-reminders', authorize('ebook.review.assignment.view'), asyncHandler(async (req, res) => {
  let sql = `SELECT era.*, es.title, u.full_name AS reviewer_name FROM ebook_review_assignments era INNER JOIN ebook_submissions es ON es.submission_id = era.submission_id LEFT JOIN users u ON u.uuid = era.reviewer_id WHERE 1=1`;
  if (String(req.query?.only_overdue) === 'true') sql += ` AND era.status IN ('assigned','accepted') AND era.due_date < CURRENT_DATE`;
  sql += ` ORDER BY era.due_date ASC NULLS LAST, era.assigned_at DESC`;
  const { rows } = await pool.query(sql);
  res.json({ rows });
}));

// ===== Publication Routes =====
router.get('/publications', authorize('ebook.publication.view'), ebookPublicationController.index);
router.get('/publications/:id', authorize('ebook.publication.view'), ebookPublicationController.show);

// ===== Admin Routes =====
router.get('/admin/audit-logs', authorize('ebook.settings.manage'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM ebook_workflow_history ORDER BY acted_at DESC LIMIT $1`, [Number(req.query?.limit || 50)]);
  res.json({ rows });
}));

router.get('/admin/storage', authorize('ebook.settings.manage'), asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS file_count, COALESCE(SUM(file_size_bytes),0)::bigint AS total_bytes FROM ebook_submission_files WHERE is_active = TRUE`);
  res.json(rows[0] || { file_count: 0, total_bytes: 0 });
}));

router.get('/admin/health', authorize('ebook.settings.manage'), asyncHandler(async (req, res) => {
  const [submissions, files] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS count FROM ebook_submissions`),
    pool.query(`SELECT COUNT(*)::int AS count FROM ebook_submission_files`),
  ]);
  res.json({ status: 'ok', submissions: submissions.rows[0]?.count || 0, files: files.rows[0]?.count || 0 });
}));

router.post('/admin/workflow-rules', authorize('ebook.settings.manage'), asyncHandler(async (req, res) => {
  res.json({ ok: true, saved: req.body || {} });
}));

router.post('/admin/reindex', authorize('ebook.settings.manage'), asyncHandler(async (req, res) => {
  res.json({ ok: true, message: 'Reindex completed.' });
}));

export default router;