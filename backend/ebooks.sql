CREATE TABLE IF NOT EXISTS ebooks (
  ebook_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,

  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  keywords TEXT[],

  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  -- SUBMITTED | SCREENING | UNDER_REVIEW | REVISION_REQUESTED | ACCEPTED | REJECTED | IN_PRODUCTION | PUBLISHED

  current_version_id UUID NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebooks_author_id ON ebooks(author_id);
CREATE INDEX IF NOT EXISTS idx_ebooks_status ON ebooks(status);


CREATE TABLE IF NOT EXISTS ebook_versions (
  version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ebook_id UUID NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,

  version_no INT NOT NULL,
  is_final BOOLEAN NOT NULL DEFAULT FALSE,

  submitted_by UUID NOT NULL REFERENCES users(uuid),
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(ebook_id, version_no)
);

CREATE INDEX IF NOT EXISTS idx_ebook_versions_ebook ON ebook_versions(ebook_id);


CREATE TABLE IF NOT EXISTS ebook_files (
  file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES ebook_versions(version_id) ON DELETE CASCADE,

  file_type VARCHAR(30) NOT NULL,
  -- ORIGINAL | REVISED | FINAL_PDF | FINAL_EPUB | SUPPLEMENTARY

  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,

  uploaded_by UUID NOT NULL REFERENCES users(uuid),
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_files_version ON ebook_files(version_id);

CREATE TABLE IF NOT EXISTS ebook_workflow_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ebook_id UUID NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,

  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  action VARCHAR(60) NOT NULL, -- e.g. SUBMIT, UPDATE, DELETE, REQUEST_REVISION, ACCEPT, REJECT
  note TEXT,

  actor_id UUID NOT NULL REFERENCES users(uuid),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_history_ebook ON ebook_workflow_history(ebook_id);


CREATE TABLE IF NOT EXISTS ebook_workflow_history (
  history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ebook_id UUID NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,

  from_status VARCHAR(30),
  to_status VARCHAR(30) NOT NULL,
  action VARCHAR(60) NOT NULL, -- e.g. SUBMIT, UPDATE, DELETE, REQUEST_REVISION, ACCEPT, REJECT
  note TEXT,

  actor_id UUID NOT NULL REFERENCES users(uuid),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_history_ebook ON ebook_workflow_history(ebook_id);

-- Add to your database schema
-- Table for screening assessments
CREATE TABLE IF NOT EXISTS screening_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ebook_id UUID NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
    editor_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    
    relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
    scope_match BOOLEAN,
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 5),
    comments TEXT,
    recommended_action VARCHAR(50) NOT NULL, -- 'SEND_TO_REVIEW', 'REQUEST_REVISION', 'REJECT'
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_ebook ON screening_assessments(ebook_id);
CREATE INDEX IF NOT EXISTS idx_screening_editor ON screening_assessments(editor_id);

-- Table for review assignments
CREATE TABLE IF NOT EXISTS review_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ebook_id UUID NOT NULL REFERENCES ebooks(ebook_id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(uuid),
    
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED, COMPLETED
    recommendation VARCHAR(30), -- ACCEPT, MINOR_REVISION, MAJOR_REVISION, REJECT
    comments TEXT,
    confidential_comments TEXT,
    
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    UNIQUE(ebook_id, reviewer_id) -- Prevent duplicate assignments
);

CREATE INDEX IF NOT EXISTS idx_review_ebook ON review_assignments(ebook_id);
CREATE INDEX IF NOT EXISTS idx_review_reviewer ON review_assignments(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_status ON review_assignments(status);


CREATE TABLE ebook_finance_clearances (
  clearance_id UUID PRIMARY KEY,
  ebook_id UUID REFERENCES ebooks(ebook_id),
  status TEXT DEFAULT 'PENDING',
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  reference TEXT,
  decision_note TEXT,
  decided_by UUID,
  decided_at TIMESTAMP
);

CREATE TABLE ebook_publications (
  publication_id UUID PRIMARY KEY,
  ebook_id UUID REFERENCES ebooks(ebook_id),
  isbn TEXT,
  doi TEXT,
  access_type TEXT,
  embargo_until TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE ebook_access_logs (
  log_id UUID PRIMARY KEY,
  ebook_id UUID REFERENCES ebooks(ebook_id),
  user_id UUID,
  action TEXT,
  ip_address TEXT,
  created_at TIMESTAMP
);


INSERT INTO users (full_name,email,phone,password,gender,dob,module_id) VALUES

-- AUTHOR
(
'Abel Researcher',
'author@ora.org',
'0911000001',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Male',
'1990-05-15',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
),

-- BOOK EDITOR
(
'Dr Hana Editor',
'editor@ora.org',
'0911000002',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Female',
'1985-02-20',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
),

-- PEER REVIEWER
(
'Prof Samuel Reviewer',
'reviewer@ora.org',
'0911000003',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Male',
'1980-09-10',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
),

-- FINANCE OFFICER
(
'Finance Officer ORA',
'finance@ora.org',
'0911000004',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Female',
'1988-07-18',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
),

-- DIGITAL CONTENT MANAGER
(
'Digital Content Manager',
'dcm@ora.org',
'0911000005',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Male',
'1987-12-12',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
),

-- ADMIN
(
'System Administrator',
'admin@ora.org',
'0911000006',
'$2a$10$wH8u7r7Y0Jq9VHtV6nRvW.bGgqJ5HkQH4s8z0c2l9K0s8W5tQ3Y9K',
'Male',
'1983-03-03',
(SELECT uuid FROM modules WHERE name='ebooks' LIMIT 1)
);



Role	Email	Password
Author	author@ora.org
	password123
Editor	editor@ora.org
	password123
Reviewer	reviewer@ora.org
	password123
Finance	finance@ora.org
	password123
Digital Manager	dcm@ora.org
	password123
Admin	admin@ora.org
	password123


