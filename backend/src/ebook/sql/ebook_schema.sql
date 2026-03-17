-- ORA eBook Publishing System schema
-- Requires PostgreSQL with pgcrypto enabled.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE ebook_submission_status AS ENUM (
    'draft',
    'submitted',
    'editor_screening',
    'under_review',
    'revision_requested',
    'accepted',
    'finance_cleared',
    'in_production',
    'published',
    'rejected'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ebook_assignment_status AS ENUM ('assigned', 'accepted', 'declined', 'submitted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ebook_recommendation AS ENUM ('accept', 'minor_revision', 'major_revision', 'reject');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ebook_payment_status AS ENUM ('pending', 'waiver_requested', 'waived', 'partially_paid', 'paid', 'cleared', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE ebook_access_level AS ENUM ('open_access', 'restricted', 'embargoed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS ebook_submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  title VARCHAR(400) NOT NULL,
  subtitle VARCHAR(400),
  abstract TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  category VARCHAR(150),
  language VARCHAR(80),
  publication_year INT,
  target_audience VARCHAR(120),
  requires_bpc BOOLEAN NOT NULL DEFAULT FALSE,
  bpc_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status ebook_submission_status NOT NULL DEFAULT 'draft',
  current_version_no INT NOT NULL DEFAULT 1,
  assigned_reviewer_count INT NOT NULL DEFAULT 0,
  final_decision ebook_recommendation,
  final_decision_note TEXT,
  submitted_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_submission_files (
  file_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  version_no INT NOT NULL DEFAULT 1,
  file_role VARCHAR(50) NOT NULL DEFAULT 'manuscript', -- manuscript, revision, proof, pdf, epub, cover, supplementary
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mime_type VARCHAR(120),
  file_size_bytes BIGINT,
  checksum_sha256 VARCHAR(64),
  uploaded_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_review_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  status ebook_assignment_status NOT NULL DEFAULT 'assigned',
  due_date DATE,
  invitation_note TEXT,
  response_note TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS ebook_reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES ebook_review_assignments(assignment_id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(uuid) ON DELETE SET NULL,
  originality_score NUMERIC(4,2),
  quality_score NUMERIC(4,2),
  relevance_score NUMERIC(4,2),
  recommendation ebook_recommendation NOT NULL,
  comments_for_author TEXT,
  confidential_comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_finance_clearances (
  finance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  invoice_number VARCHAR(120),
  currency_code VARCHAR(12) NOT NULL DEFAULT 'ETB',
  amount_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  waiver_requested BOOLEAN NOT NULL DEFAULT FALSE,
  waiver_percentage NUMERIC(5,2),
  waiver_reason TEXT,
  payment_status ebook_payment_status NOT NULL DEFAULT 'pending',
  payment_reference VARCHAR(200),
  receipt_number VARCHAR(120),
  reviewed_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  review_note TEXT,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_production (
  production_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  handled_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  pdf_ready BOOLEAN NOT NULL DEFAULT FALSE,
  epub_ready BOOLEAN NOT NULL DEFAULT FALSE,
  proof_sent_to_author BOOLEAN NOT NULL DEFAULT FALSE,
  author_proof_approved BOOLEAN NOT NULL DEFAULT FALSE,
  isbn VARCHAR(50),
  doi VARCHAR(120),
  repository_path TEXT,
  quality_note TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_publications (
  publication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  production_id UUID REFERENCES ebook_production(production_id) ON DELETE SET NULL,
  published_by UUID REFERENCES users(uuid) ON DELETE SET NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  access_level ebook_access_level NOT NULL DEFAULT 'open_access',
  embargo_until DATE,
  license_name VARCHAR(150),
  landing_page_title VARCHAR(400),
  cover_image_path TEXT,
  published_at TIMESTAMPTZ,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_workflow_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES ebook_submissions(submission_id) ON DELETE CASCADE,
  from_status ebook_submission_status,
  to_status ebook_submission_status,
  action VARCHAR(120) NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  acted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ebook_access_logs (
  access_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES ebook_publications(publication_id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
  event_type VARCHAR(40) NOT NULL DEFAULT 'view',
  ip_address VARCHAR(64),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_submissions_author ON ebook_submissions(author_id);
CREATE INDEX IF NOT EXISTS idx_ebook_submissions_status ON ebook_submissions(status);
CREATE INDEX IF NOT EXISTS idx_ebook_assignments_reviewer ON ebook_review_assignments(reviewer_id, status);
CREATE INDEX IF NOT EXISTS idx_ebook_reviews_submission ON ebook_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_ebook_publications_public ON ebook_publications(is_public, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebook_access_logs_pub ON ebook_access_logs(publication_id, created_at DESC);
