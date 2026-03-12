CREATE DATABASE user_management;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  password TEXT,
  gender VARCHAR(10),
  dob DATE,
  module_id UUID REFERENCES modules(uuid), -- <--- new column
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE roles (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  module_id UUID NOT NULL REFERENCES modules(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(uuid) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(uuid) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(uuid) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(uuid) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);


INSERT INTO role_permissions (role_id, permission_id)
SELECT r.uuid, p.uuid
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'role.manage'
ON CONFLICT DO NOTHING;




INSERT INTO user_roles (user_id, role_id)
SELECT u.uuid, r.uuid
FROM users u, roles r
WHERE u.email = 'anire@example.com' AND r.name = 'admin'
ON CONFLICT DO NOTHING;

CREATE TABLE modules (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- =========================
-- Journal Management Module
-- =========================

CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    issn VARCHAR(20) UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT
);

-- =========================
-- Manuscript Statuses
-- =========================

CREATE TABLE manuscript_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., DRAFT, SUBMITTED
    label VARCHAR(100) NOT NULL,        -- e.g., Draft, Submitted
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Manuscripts
-- =========================

CREATE TABLE manuscripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES journals(id),
    section_id UUID REFERENCES journal_sections(id),
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT,
    language VARCHAR(50),
    article_type VARCHAR(100),
    status_id UUID NOT NULL REFERENCES manuscript_statuses(id), -- FK instead of ENUM
    submission_date TIMESTAMP,
    created_by UUID NOT NULL,
    current_version INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manuscript_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID NOT NULL,
    CONSTRAINT unique_version_per_manuscript UNIQUE (manuscript_id, version_number)
);

CREATE TABLE manuscript_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL,
    author_order INTEGER NOT NULL,
    is_corresponding BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_author_order UNIQUE (manuscript_id, author_order)
);

-- =========================
-- Review Statuses & Assignments
-- =========================

CREATE TABLE review_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., INVITED, ACCEPTED, COMPLETED
    label VARCHAR(100) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL,
    assigned_by UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_id UUID NOT NULL REFERENCES review_statuses(id) -- FK instead of ENUM
);

CREATE TABLE review_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., ACCEPT, MINOR_REVISION
    label VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    recommendation_id UUID NOT NULL REFERENCES review_recommendations(id), -- FK
    comments_to_author TEXT,
    comments_to_editor TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Editorial Decisions
-- =========================

CREATE TABLE editorial_decision_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,   -- e.g., ACCEPT, REJECT
    label VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE editorial_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    decision_id UUID NOT NULL REFERENCES editorial_decision_types(id), -- FK instead of ENUM
    decision_by UUID NOT NULL,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- =========================
-- Journal Issues & Published Articles
-- =========================

CREATE TABLE journal_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID NOT NULL REFERENCES journals(id),
    volume INTEGER NOT NULL,
    issue INTEGER NOT NULL,
    year INTEGER NOT NULL,
    publication_date DATE,
    CONSTRAINT unique_issue UNIQUE (journal_id, volume, issue)
);

CREATE TABLE published_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID NOT NULL UNIQUE REFERENCES manuscripts(id),
    issue_id UUID NOT NULL REFERENCES journal_issues(id),
    doi VARCHAR(255) UNIQUE,
    publication_date DATE
);

-- =========================
-- Audit Logs
-- =========================

CREATE TABLE jm_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

