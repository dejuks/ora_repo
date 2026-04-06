
const delay = (value, ms = 20) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));
const clone = (value) => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();

const ROLE_OPTIONS = [
  { reviewer_id: "rev-001", user_id: "rev-001", full_name: "Dr. Hana Bekele", email: "hana.reviewer@ora.local", expertise: ["Education", "Open Learning"], status: "available" },
  { reviewer_id: "rev-002", user_id: "rev-002", full_name: "Dr. Samuel Tadesse", email: "samuel.reviewer@ora.local", expertise: ["Digital Libraries", "Information Science"], status: "available" },
  { reviewer_id: "rev-003", user_id: "rev-003", full_name: "Dr. Ruth Mekonnen", email: "ruth.reviewer@ora.local", expertise: ["Technology", "Publishing"], status: "busy" },
];

let submissions = [
  {
    submission_id: "sub-001",
    title: "Open Access Knowledge Systems in East Africa",
    subtitle: "Strategies for Institutional eBook Publishing",
    abstract: "A practical study on institutional eBook publishing workflows and open access delivery.",
    keywords: ["open access", "workflow", "repository"],
    category: "Library & Information Science",
    language: "English",
    publication_year: 2026,
    target_audience: "Researchers",
    status: "submitted",
    stage: "screening",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-04-01T08:30:00Z",
    updated_at: "2026-04-02T09:00:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 0,
    final_decision: null,
    amount_due: 0,
    payment_status: "not_required",
    access_rights: "Open Access",
    proof_sent_to_author: false,
    author_proof_approved: false,
    reviewer_summary: "Awaiting editorial screening.",
  },
  {
    submission_id: "sub-002",
    title: "Digital Scholarship and Metadata Quality",
    subtitle: "An ORA eBook Workflow Guide",
    abstract: "Shows metadata, DOI, ISBN, and final repository publishing steps.",
    keywords: ["metadata", "doi", "isbn"],
    category: "Digital Publishing",
    language: "English",
    publication_year: 2026,
    target_audience: "Editors",
    status: "under_review",
    stage: "reviews",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-03-22T11:00:00Z",
    updated_at: "2026-04-03T10:15:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 2,
    final_decision: null,
    amount_due: 0,
    payment_status: "not_required",
    access_rights: "Restricted",
    proof_sent_to_author: false,
    author_proof_approved: false,
    reviewer_summary: "Two reviewers assigned; one report submitted.",
  },
  {
    submission_id: "sub-003",
    title: "Community Archives and Public Memory",
    subtitle: "Case Studies in Ethiopia",
    abstract: "A humanities title currently in revision after editorial decision.",
    keywords: ["archives", "culture", "ethiopia"],
    category: "Humanities",
    language: "English",
    publication_year: 2026,
    target_audience: "Public Readers",
    status: "revision_requested",
    stage: "revisions",
    current_version_no: 2,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-03-10T09:00:00Z",
    updated_at: "2026-04-01T14:20:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 2,
    final_decision: "major_revision",
    amount_due: 0,
    payment_status: "not_required",
    access_rights: "Restricted",
    proof_sent_to_author: false,
    author_proof_approved: false,
    reviewer_summary: "Major revisions requested by editor.",
  },
  {
    submission_id: "sub-004",
    title: "Repository UX for Academic Readers",
    subtitle: "Search, Access, and Analytics",
    abstract: "Accepted manuscript waiting for BPC payment verification.",
    keywords: ["ux", "analytics", "readers"],
    category: "Information Systems",
    language: "English",
    publication_year: 2026,
    target_audience: "Libraries",
    status: "accepted",
    stage: "payments",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-03-06T08:00:00Z",
    updated_at: "2026-04-02T13:00:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 2,
    final_decision: "accept",
    amount_due: 250,
    payment_status: "payment_uploaded",
    access_rights: "Open Access",
    proof_sent_to_author: false,
    author_proof_approved: false,
    reviewer_summary: "Accepted. Waiting for finance clearance.",
  },
  {
    submission_id: "sub-005",
    title: "From Manuscript to PDF and EPUB",
    subtitle: "Production Checklist for ORA",
    abstract: "Finance cleared title waiting for digital production and repository handoff.",
    keywords: ["pdf", "epub", "production"],
    category: "Digital Production",
    language: "English",
    publication_year: 2026,
    target_audience: "Production Team",
    status: "finance_cleared",
    stage: "production",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-03-01T08:00:00Z",
    updated_at: "2026-04-01T16:40:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 2,
    final_decision: "accept",
    amount_due: 300,
    payment_status: "verified",
    access_rights: "Embargo",
    proof_sent_to_author: true,
    author_proof_approved: false,
    reviewer_summary: "Ready for PDF/EPUB conversion and final metadata.",
  },
  {
    submission_id: "sub-006",
    title: "Open Educational Repositories for Universities",
    subtitle: "Policy and Practice",
    abstract: "Published eBook already released to the public catalog.",
    keywords: ["education", "repository", "policy"],
    category: "Education",
    language: "English",
    publication_year: 2026,
    target_audience: "Universities",
    status: "published",
    stage: "published",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-02-18T08:00:00Z",
    updated_at: "2026-04-04T07:00:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 2,
    final_decision: "accept",
    amount_due: 0,
    payment_status: "waived",
    access_rights: "Open Access",
    proof_sent_to_author: true,
    author_proof_approved: true,
    reviewer_summary: "Published and indexed in ORA Digital Library.",
    isbn: "978-99944-10-10-1",
    doi: "10.5555/ora.ebook.2026.001",
    repository_url: "/ebook/publications/sub-006",
  },
  {
    submission_id: "sub-007",
    title: "Legacy Catalog Cleanup Project",
    subtitle: "Why Standardized Metadata Matters",
    abstract: "Rejected after editorial decision.",
    keywords: ["metadata", "cleanup"],
    category: "Cataloging",
    language: "English",
    publication_year: 2026,
    target_audience: "Catalogers",
    status: "rejected",
    stage: "rejected",
    current_version_no: 1,
    author_id: "author-001",
    author_name: "Temam Aman",
    submitted_at: "2026-03-03T08:00:00Z",
    updated_at: "2026-03-18T08:00:00Z",
    editor_id: "editor-001",
    editor_name: "Sara Editor",
    assigned_reviewer_count: 1,
    final_decision: "reject",
    amount_due: 0,
    payment_status: "not_required",
    access_rights: "Restricted",
    proof_sent_to_author: false,
    author_proof_approved: false,
    reviewer_summary: "Rejected after editorial assessment.",
  },
];

let reviewAssignments = [
  {
    assignment_id: "assign-001",
    submission_id: "sub-002",
    reviewer_id: "rev-001",
    reviewer_name: "Dr. Hana Bekele",
    status: "accepted",
    recommendation: "minor_revision",
    comments: "Strong study with a few metadata clarifications needed.",
    confidential_comments: "Editor may request clearer methods section.",
    assigned_at: "2026-03-24T10:00:00Z",
    accepted_at: "2026-03-24T14:30:00Z",
    completed_at: null,
    due_date: "2026-04-08T12:00:00Z",
  },
  {
    assignment_id: "assign-002",
    submission_id: "sub-002",
    reviewer_id: "rev-002",
    reviewer_name: "Dr. Samuel Tadesse",
    status: "submitted",
    recommendation: "accept",
    comments: "Ready for acceptance after tiny language polishing.",
    confidential_comments: "Good fit for ORA workflow collection.",
    assigned_at: "2026-03-24T10:00:00Z",
    accepted_at: "2026-03-25T09:00:00Z",
    completed_at: "2026-04-02T16:00:00Z",
    due_date: "2026-04-07T12:00:00Z",
  },
  {
    assignment_id: "assign-003",
    submission_id: "sub-003",
    reviewer_id: "rev-003",
    reviewer_name: "Dr. Ruth Mekonnen",
    status: "submitted",
    recommendation: "major_revision",
    comments: "Needs stronger evidence in chapter 3.",
    confidential_comments: "Potential after major revision.",
    assigned_at: "2026-03-11T09:00:00Z",
    accepted_at: "2026-03-11T15:00:00Z",
    completed_at: "2026-03-20T12:30:00Z",
    due_date: "2026-03-22T12:00:00Z",
  },
];

let publications = [
  {
    publication_id: "pub-001",
    submission_id: "sub-006",
    title: submissions.find((s) => s.submission_id === "sub-006")?.title,
    author_name: "Temam Aman",
    category: "Education",
    year: 2026,
    access_rights: "Open Access",
    isbn: "978-99944-10-10-1",
    doi: "10.5555/ora.ebook.2026.001",
    description: "Published ORA eBook available for readers.",
    downloads: 342,
    views: 1120,
    status: "published",
    file_url: "/mock-files/sub-006.pdf",
  },
];

let invoices = {
  "sub-004": { invoice_no: "INV-ORA-2026-004", amount: 250, currency: "USD", status: "issued", issued_at: "2026-04-02T10:00:00Z" },
  "sub-005": { invoice_no: "INV-ORA-2026-005", amount: 300, currency: "USD", status: "paid", issued_at: "2026-03-30T10:00:00Z" },
};

let financeTransactions = {
  "sub-004": [{ type: "payment_uploaded", note: "Author uploaded transfer slip.", created_at: "2026-04-02T13:00:00Z" }],
  "sub-005": [{ type: "payment_verified", note: "Finance cleared for production.", created_at: "2026-04-01T16:40:00Z" }],
};

let adminRules = {
  review_deadline_days: 14,
  default_access_rights: "Open Access",
  require_bpc_for_open_access: true,
  auto_notify_editor_on_submission: true,
};

const stageFromStatus = (status) => ({
  draft: "drafts",
  submitted: "screening",
  under_review: "reviews",
  revision_requested: "revisions",
  accepted: "payments",
  finance_cleared: "production",
  published: "published",
  rejected: "rejected",
}[status] || "all");

function getSubmissionById(id) {
  return submissions.find((item) => item.submission_id === id);
}

function getAssignmentsForSubmission(id) {
  return reviewAssignments.filter((item) => item.submission_id === id);
}

function buildWorkflow(id) {
  const row = getSubmissionById(id);
  if (!row) return null;
  const assignments = getAssignmentsForSubmission(id);
  const publication = publications.find((item) => item.submission_id === id) || null;
  return {
    submission: row,
    workflow: [
      { step: 1, title: "Manuscript Submission", actor: "Author", status: ["draft", "submitted", "under_review", "revision_requested", "accepted", "finance_cleared", "published", "rejected"].includes(row.status) ? "completed" : "pending", note: "Author uploads manuscript and enters metadata." },
      { step: 2, title: "Initial Editorial Screening", actor: "Book Editor", status: ["under_review", "revision_requested", "accepted", "finance_cleared", "published", "rejected"].includes(row.status) ? "completed" : row.status === "submitted" ? "active" : "pending", note: "Editor checks relevance, scope, and quality." },
      { step: 3, title: "Peer Review Process", actor: "Peer Reviewer", status: ["revision_requested", "accepted", "finance_cleared", "published", "rejected"].includes(row.status) ? "completed" : row.status === "under_review" ? "active" : "pending", note: "Peer reviewers evaluate and submit structured feedback." },
      { step: 4, title: "Editorial Decision", actor: "Book Editor", status: ["revision_requested", "accepted", "finance_cleared", "published", "rejected"].includes(row.status) ? "completed" : "pending", note: row.final_decision ? `Decision recorded: ${row.final_decision}` : "Decision pending." },
      { step: 5, title: "Author Revision", actor: "Author", status: ["accepted", "finance_cleared", "published"].includes(row.status) ? "completed" : row.status === "revision_requested" ? "active" : "pending", note: "Author uploads revised manuscript when requested." },
      { step: 6, title: "Financial Clearance", actor: "Finance & Operations Officer", status: ["finance_cleared", "published"].includes(row.status) ? "completed" : row.status === "accepted" ? "active" : "pending", note: "Verify payment or waiver." },
      { step: 7, title: "Digital Production", actor: "Digital Content Manager", status: row.status === "published" ? "completed" : row.status === "finance_cleared" ? "active" : "pending", note: "Convert to PDF/EPUB, assign ISBN/DOI, and prepare final metadata." },
      { step: 8, title: "Publication & Release", actor: "Digital Content Manager & System", status: row.status === "published" ? "completed" : "pending", note: "Publish eBook and enable reader access." },
      { step: 9, title: "Reader Access", actor: "Reader / Public User", status: row.status === "published" ? "completed" : "pending", note: "Readers search, view, and download according to permissions." },
    ],
    timeline: [
      { action: "Submission created", actor: row.author_name, created_at: row.submitted_at, note: "Manuscript and metadata entered." },
      { action: "Workflow updated", actor: row.editor_name || "System", created_at: row.updated_at, note: row.reviewer_summary || row.status },
      ...assignments.map((item) => ({ action: `Review ${item.status}`, actor: item.reviewer_name, created_at: item.completed_at || item.accepted_at || item.assigned_at, note: item.comments })),
    ],
    submission_files: [
      { file_id: `${id}-file-1`, role: "manuscript", original_name: `${row.title}.docx`, uploaded_at: row.submitted_at },
      { file_id: `${id}-file-2`, role: "metadata_sheet", original_name: `${row.title}-metadata.xlsx`, uploaded_at: row.updated_at },
    ],
    review_assignments: assignments,
    production: publication ? { ...publication, pdf_ready: true, epub_ready: true } : { pdf_ready: row.status === "finance_cleared", epub_ready: false },
    finance: {
      invoice: invoices[id] || null,
      transactions: financeTransactions[id] || [],
      payment_status: row.payment_status,
      amount_due: row.amount_due || 0,
    },
  };
}

function matchesSearch(row, search) {
  if (!search) return true;
  const q = String(search).toLowerCase();
  return [row.title, row.subtitle, row.abstract, row.category, row.status, row.author_name].filter(Boolean).join(" ").toLowerCase().includes(q);
}

function filterSubmissions(params = {}, rows = submissions) {
  let list = rows.filter((row) => matchesSearch(row, params.search || params.q));
  if (params.status) list = list.filter((row) => row.status === params.status);
  if (params.stage) list = list.filter((row) => {
    if (params.stage === "handoff") return ["finance_cleared", "published"].includes(row.status);
    if (params.stage === "screened") return ["under_review", "revision_requested", "accepted", "finance_cleared", "published", "rejected"].includes(row.status);
    if (params.stage === "under_review") return row.status === "under_review";
    if (params.stage === "decisions") return ["revision_requested", "accepted", "rejected"].includes(row.status);
    if (params.stage === "payments") return row.stage === "payments" || row.status === "accepted";
    if (params.stage === "proofs") return !!row.proof_sent_to_author && !row.author_proof_approved;
    if (params.stage === "revisions") return row.status === "revision_requested";
    if (params.stage === "screening") return row.status === "submitted";
    if (params.stage === "reviews") return row.status === "under_review";
    if (params.stage === "production") return row.status === "finance_cleared";
    return row.stage === params.stage;
  });
  if (params.author_only) list = list.filter((row) => row.author_id === "author-001");
  const limit = Number(params.limit || params.per_page || list.length || 20);
  const page = Number(params.page || 1);
  const start = (page - 1) * limit;
  return {
    rows: list.slice(start, start + limit),
    total: list.length,
    page,
    limit,
    pagination: { total: list.length, page, per_page: limit, last_page: Math.max(1, Math.ceil(list.length / limit)) },
    summary: {
      total_submissions: list.length,
      screening: list.filter((row) => row.status === "submitted").length,
      under_review: list.filter((row) => row.status === "under_review").length,
      revision_requested: list.filter((row) => row.status === "revision_requested").length,
      accepted: list.filter((row) => row.status === "accepted").length,
      finance_cleared: list.filter((row) => row.status === "finance_cleared").length,
      published: list.filter((row) => row.status === "published").length,
      rejected: list.filter((row) => row.status === "rejected").length,
      overdue: reviewAssignments.filter((a) => a.status !== "submitted").length,
    },
  };
}

function filterAssignments(params = {}) {
  let list = reviewAssignments.map((item) => ({ ...item, submission: getSubmissionById(item.submission_id), title: getSubmissionById(item.submission_id)?.title }));
  if (params.submission_id) list = list.filter((item) => item.submission_id === params.submission_id);
  if (params.assignment_id) list = list.filter((item) => item.assignment_id === params.assignment_id);
  if (params.status) list = list.filter((item) => item.status === params.status);
  return { rows: list, total: list.length };
}

const ebookMockApi = {
  async getAuthorDashboard() {
    const own = submissions.filter((row) => row.author_id === "author-001");
    return delay({ summary: filterSubmissions({}, own).summary, submissions: own });
  },
  async getEditorDashboard() {
    const data = filterSubmissions();
    return delay({ summary: data.summary, submissions: data.rows });
  },
  async getReviewerDashboard() {
    const assignments = filterAssignments().rows;
    return delay({
      summary: {
        total_assignments: assignments.length,
        pending: assignments.filter((a) => ["assigned", "accepted"].includes(a.status)).length,
        submitted: assignments.filter((a) => a.status === "submitted").length,
      },
      assignments,
    });
  },
  async getFinanceDashboard() {
    const rows = submissions.filter((row) => ["accepted", "finance_cleared", "published"].includes(row.status));
    return delay({
      summary: {
        pending: rows.filter((row) => row.payment_status === "payment_uploaded").length,
        cleared: rows.filter((row) => row.status === "finance_cleared" || row.status === "published").length,
        waived: rows.filter((row) => row.payment_status === "waived").length,
        invoices: Object.keys(invoices).length,
      },
      finances: rows,
      rows,
    });
  },
  async getProductionDashboard() {
    const rows = submissions.filter((row) => ["finance_cleared", "published"].includes(row.status));
    return delay({ summary: { total: rows.length, ready: rows.filter((r) => r.status === "finance_cleared").length, published: rows.filter((r) => r.status === "published").length }, production: rows, rows });
  },
  async listMySubmissions(params = {}) {
    return delay(filterSubmissions({ ...params, author_only: true }, submissions.filter((row) => row.author_id === "author-001")));
  },
  async listSubmissions(params = {}) { return delay(filterSubmissions(params)); },
  async getEditorQueue(params = {}) {
    const data = filterSubmissions(params);
    return delay({ ...data, submissions: data.rows });
  },
  async screening(id, payload = {}) {
    const row = getSubmissionById(id); if (row) { row.status = payload.recommended_action === "return_for_corrections" ? "revision_requested" : "under_review"; row.stage = stageFromStatus(row.status); row.updated_at = nowIso(); row.screening_note = payload.comments || payload.note || "Screened in mock data."; }
    return delay({ success: true, submission: row });
  },
  async makeDecision(id, payload = {}) {
    const row = getSubmissionById(id); if (row) { const map = { accept: "accepted", accepted: "accepted", reject: "rejected", rejected: "rejected", minor_revision: "revision_requested", major_revision: "revision_requested", revisions: "revision_requested" }; row.final_decision = payload.decision || payload.recommendation || "accept"; row.status = map[row.final_decision] || "accepted"; row.stage = stageFromStatus(row.status); row.updated_at = nowIso(); }
    return delay({ success: true, submission: row });
  },
  async assignReviewer(submissionId, payload = {}) {
    const reviewer = ROLE_OPTIONS.find((item) => item.user_id === payload.reviewer_id || item.reviewer_id === payload.reviewer_id) || ROLE_OPTIONS[0];
    const item = { assignment_id: `assign-${Date.now()}`, submission_id: submissionId, reviewer_id: reviewer.reviewer_id, reviewer_name: reviewer.full_name, status: "assigned", recommendation: null, comments: "", confidential_comments: "", assigned_at: nowIso(), accepted_at: null, completed_at: null, due_date: payload.due_date || nowIso() };
    reviewAssignments.push(item);
    const row = getSubmissionById(submissionId); if (row) { row.assigned_reviewer_count = getAssignmentsForSubmission(submissionId).length; row.status = "under_review"; row.stage = "reviews"; }
    return delay({ success: true, assignment: item });
  },
  async listReviewerOptions() { return delay({ rows: ROLE_OPTIONS, reviewers: ROLE_OPTIONS }); },
  async listReviewAssignments(params = {}) { return delay(filterAssignments(params)); },
  async getReviewAssignmentDetail(id) {
    const row = reviewAssignments.find((item) => item.assignment_id === id);
    return delay({ assignment: { ...row, submission: getSubmissionById(row?.submission_id) }, review: row });
  },
  async getReviewAssignmentFiles(id) {
    const row = reviewAssignments.find((item) => item.assignment_id === id);
    const sub = getSubmissionById(row?.submission_id);
    return delay({ rows: [{ file_id: `${id}-manuscript`, role: "manuscript", original_name: `${sub?.title || 'manuscript'}.docx` }, { file_id: `${id}-guidelines`, role: "review_template", original_name: "ORA-review-template.docx" }] });
  },
  async getReviewTemplate() { return delay({ sections: ["Originality", "Relevance", "Methodology", "Language Quality", "Recommendation"] }); },
  async respondAssignment(id, payload = {}) {
    const row = reviewAssignments.find((item) => item.assignment_id === id); if (row) { row.status = payload.response_status || payload.status || "accepted"; row.accepted_at = nowIso(); }
    return delay({ success: true, assignment: row });
  },
  async submitReview(id, payload = {}) {
    const row = reviewAssignments.find((item) => item.assignment_id === id); if (row) { row.status = "submitted"; row.recommendation = payload.recommendation || "minor_revision"; row.comments = payload.comments || payload.summary || "Structured review submitted."; row.confidential_comments = payload.confidential_comments || ""; row.completed_at = nowIso(); }
    return delay({ success: true, assignment: row });
  },
  async updateReview(id, payload = {}) { return this.submitReview(id, payload); },
  async requestReviewExtension(id, payload = {}) { return delay({ success: true, requested: true, note: payload.note || "Extension requested." }); },
  async uploadReviewFile(id, file) { return delay({ success: true, file: { assignment_id: id, original_name: file?.name || "review-attachment.docx" } }); },
  async getWorkflow(id) { return delay(buildWorkflow(id)); },
  async getSubmission(id) { return delay({ submission: getSubmissionById(id), row: getSubmissionById(id) }); },
  async listFiles(id) { return delay({ rows: buildWorkflow(id)?.submission_files || [] }); },
  async createSubmission(payload = {}) {
    const item = { submission_id: `sub-${String(Date.now()).slice(-6)}`, title: payload.title || "Untitled ORA eBook", subtitle: payload.subtitle || "", abstract: payload.abstract || "", keywords: payload.keywords || [], category: payload.category || "General", language: payload.language || "English", publication_year: payload.publication_year || 2026, target_audience: payload.target_audience || "Researchers", status: payload.status || "draft", stage: stageFromStatus(payload.status || "draft"), current_version_no: 1, author_id: "author-001", author_name: "Temam Aman", submitted_at: nowIso(), updated_at: nowIso(), editor_id: "editor-001", editor_name: "Sara Editor", assigned_reviewer_count: 0, final_decision: null, amount_due: 0, payment_status: "not_required", access_rights: "Open Access", proof_sent_to_author: false, author_proof_approved: false };
    submissions.unshift(item);
    return delay(item);
  },
  async updateSubmission(id, payload = {}) {
    const row = getSubmissionById(id); if (row) Object.assign(row, payload, { updated_at: nowIso() });
    return delay({ success: true, submission: row });
  },
  async submitSubmission(id) {
    const row = getSubmissionById(id); if (row) { row.status = "submitted"; row.stage = "screening"; row.updated_at = nowIso(); }
    return delay({ success: true, submission: row });
  },
  async resubmitSubmission(id, payload = {}) {
    const row = getSubmissionById(id); if (row) { row.status = "submitted"; row.stage = "screening"; row.current_version_no += 1; row.updated_at = nowIso(); row.resubmission_note = payload.note || "Revision resubmitted."; }
    return delay({ success: true, submission: row });
  },
  async uploadFile(id, file, role = "manuscript") { return delay({ success: true, file: { submission_id: id, role, original_name: file?.name || `${role}.pdf`, uploaded_at: nowIso() } }); },
  async getReviewComments(id) {
    const assignments = getAssignmentsForSubmission(id);
    return delay({ rows: assignments, comments: assignments.map((item) => ({ reviewer_name: item.reviewer_name, recommendation: item.recommendation, comments: item.comments })) });
  },
  async submitPaymentProof(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "payment_uploaded"; row.updated_at = nowIso(); } return delay({ success: true, payment: { submission_id: id, ...payload } }); },
  async requestWaiver(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "waiver_requested"; row.updated_at = nowIso(); } return delay({ success: true, waiver: { submission_id: id, ...payload } }); },
  async approveProof(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.author_proof_approved = true; row.updated_at = nowIso(); } return delay({ success: true, note: payload.note || "Proof approved." }); },
  async getFinanceTransactions(id) { return delay({ rows: financeTransactions[id] || [] }); },
  async getInvoice(id) { return delay(invoices[id] || null); },
  async issueInvoice(id, payload = {}) { invoices[id] = { invoice_no: `INV-ORA-${new Date().getFullYear()}-${id.slice(-3)}`, amount: Number(payload.amount || getSubmissionById(id)?.amount_due || 0), currency: payload.currency || "USD", status: "issued", issued_at: nowIso() }; return delay({ success: true, invoice: invoices[id] }); },
  async approveWaiver(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "waived"; row.status = "finance_cleared"; row.stage = "production"; row.updated_at = nowIso(); } financeTransactions[id] = [...(financeTransactions[id] || []), { type: "waiver_approved", note: payload.note || "Waiver approved.", created_at: nowIso() }]; return delay({ success: true }); },
  async declineWaiver(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "waiver_declined"; row.updated_at = nowIso(); } financeTransactions[id] = [...(financeTransactions[id] || []), { type: "waiver_declined", note: payload.note || "Waiver declined.", created_at: nowIso() }]; return delay({ success: true }); },
  async verifyPayment(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "verified"; row.status = "finance_cleared"; row.stage = "production"; row.updated_at = nowIso(); } financeTransactions[id] = [...(financeTransactions[id] || []), { type: "payment_verified", note: payload.note || "Payment verified.", created_at: nowIso() }]; return delay({ success: true }); },
  async rejectPayment(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.payment_status = "rejected"; row.updated_at = nowIso(); } financeTransactions[id] = [...(financeTransactions[id] || []), { type: "payment_rejected", note: payload.note || "Payment rejected.", created_at: nowIso() }]; return delay({ success: true }); },
  async upsertProduction(id, payload = {}) { const row = getSubmissionById(id); if (row) { Object.assign(row, { isbn: payload.isbn || row.isbn || "978-99944-00-00-0", doi: payload.doi || row.doi || `10.5555/ora.ebook.${id}`, access_rights: payload.access_rights || row.access_rights || "Open Access", updated_at: nowIso() }); } return delay({ success: true, production: buildWorkflow(id)?.production }); },
  async publishSubmission(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.status = "published"; row.stage = "published"; row.updated_at = nowIso(); row.access_rights = payload.access_rights || row.access_rights || "Open Access"; row.isbn = payload.isbn || row.isbn || "978-99944-11-11-1"; row.doi = payload.doi || row.doi || `10.5555/ora.ebook.${id}`; }
    if (!publications.some((item) => item.submission_id === id) && row) { publications.unshift({ publication_id: `pub-${Date.now()}`, submission_id: id, title: row.title, author_name: row.author_name, category: row.category, year: row.publication_year, access_rights: row.access_rights, isbn: row.isbn, doi: row.doi, description: row.abstract, downloads: 0, views: 0, status: "published", file_url: `/mock-files/${id}.pdf` }); }
    return delay({ success: true, publication: publications.find((item) => item.submission_id === id) });
  },
  async listPublications(params = {}) { let rows = publications.filter((item) => matchesSearch(item, params.search || params.q)); return delay({ rows, total: rows.length, pagination: { total: rows.length } }); },
  async listPublicCatalog(params = {}) { return this.listPublications(params); },
  async getPublicSearchSuggestions(params = {}) { const q = String(params.q || "").toLowerCase(); const rows = publications.filter((item) => item.title.toLowerCase().includes(q)).slice(0, Number(params.limit || 6)).map((item) => ({ value: item.title, label: item.title, submission_id: item.submission_id })); return delay({ rows, suggestions: rows }); },
  async getPublicPublication(id) { const row = publications.find((item) => item.submission_id === id || item.publication_id === id); return delay({ ...row, publication: row, submission: getSubmissionById(row?.submission_id) }); },
  async getPublicCitation(id) { const row = publications.find((item) => item.submission_id === id || item.publication_id === id); return delay({ citation: `${row?.author_name} (${row?.year}). ${row?.title}. ORA Digital Library. DOI: ${row?.doi}` }); },
  async downloadPublicPublication(id) { return delay({ success: true, url: publications.find((item) => item.submission_id === id || item.publication_id === id)?.file_url || "/mock-files/download.pdf" }); },
  async approveForProduction(id, payload = {}) { const row = getSubmissionById(id); if (row) { row.status = "finance_cleared"; row.stage = "production"; row.updated_at = nowIso(); } return delay({ success: true, note: payload.note || "Approved for production." }); },
  async notifyAuthor(id, payload = {}) { return delay({ success: true, message: payload.message || "Author notified." }); },
  async addEditorComment(id, payload = {}) { return delay({ success: true, note: payload.note || "Comment saved." }); },
  async getReviewerReminders() { const rows = reviewAssignments.filter((item) => item.status !== "submitted").map((item) => ({ ...item, overdue: true })); return delay({ rows, total: rows.length }); },
  async getAdminHealth() { return delay({ status: "healthy", queue_status: "stable", search_index: "ready", mock_mode: true }); },
  async getAdminStorage() { return delay({ used_mb: 128, available_mb: 8192, repository_items: publications.length, mock_mode: true }); },
  async getAdminAuditLogs() { return delay({ rows: [ { action: "submission_created", actor: "Temam Aman", created_at: "2026-04-01T08:30:00Z" }, { action: "review_submitted", actor: "Dr. Samuel Tadesse", created_at: "2026-04-02T16:00:00Z" }, { action: "publication_released", actor: "Digital Content Manager", created_at: "2026-04-04T07:00:00Z" } ] }); },
  async saveWorkflowRules(payload = {}) { adminRules = { ...adminRules, ...payload }; return delay({ success: true, rules: adminRules }); },
  async reindexAdmin() { return delay({ success: true, indexed_items: publications.length, completed_at: nowIso() }); },
};

export default ebookMockApi;
