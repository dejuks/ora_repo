-- ORA eBook Publishing Workflow Extensions
-- PostgreSQL

-- 1) Finance clearance
CREATE TABLE IF NOT EXISTS ebook_finance_clearances (
  ebook_id uuid PRIMARY KEY REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'PENDING', -- PENDING | CLEARED | WAIVED | DECLINED
  amount numeric(12,2) NULL,
  currency text NULL,
  reference text NULL,
  note text NULL,
  cleared_by uuid NULL REFERENCES users(uuid) ON DELETE SET NULL,
  cleared_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_finance_status ON ebook_finance_clearances(status);

-- 2) Publication metadata
CREATE TABLE IF NOT EXISTS ebook_publications (
  ebook_id uuid PRIMARY KEY REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
  isbn text NULL,
  doi text NULL,
  access_type text NOT NULL DEFAULT 'OPEN', -- OPEN | RESTRICTED | EMBARGO
  embargo_until timestamptz NULL,

  final_pdf_file_id uuid NULL REFERENCES ebook_files(file_id) ON DELETE SET NULL,
  final_epub_file_id uuid NULL REFERENCES ebook_files(file_id) ON DELETE SET NULL,
  cover_file_id uuid NULL REFERENCES ebook_files(file_id) ON DELETE SET NULL,

  published_by uuid NULL REFERENCES users(uuid) ON DELETE SET NULL,
  published_at timestamptz NULL,

  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- 3) Public access logs (downloads/views)
CREATE TABLE IF NOT EXISTS ebook_access_logs (
  id bigserial PRIMARY KEY,
  ebook_id uuid NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
  access_type text NULL,
  action text NOT NULL, -- DOWNLOAD | VIEW
  user_id uuid NULL REFERENCES users(uuid) ON DELETE SET NULL,
  ip_address text NULL,
  user_agent text NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_access_logs_ebook_id ON ebook_access_logs(ebook_id);
