CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE workflow_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO workflow_stages (name, stage_order) VALUES
('Submitted', 1),
('Screening', 2),
('Peer Review', 3),
('Revision', 4),
('Accepted', 5),
('Published', 6);

CREATE TYPE manuscript_status AS ENUM (
    'submitted',
    'screening',
    'under_review',
    'revision',
    'accepted',
    'rejected',
    'published'
);

CREATE TABLE manuscripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    abstract TEXT,
    category_id INTEGER REFERENCES categories(id),
    corresponding_author_id UUID REFERENCES users(id),
    status manuscript_status DEFAULT 'submitted',
    current_stage_id INTEGER REFERENCES workflow_stages(id),
    
    ADD COLUMN created_by UUID REFERENCES users(uuid) NOT NULL;

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE manuscript_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    author_order INTEGER NOT NULL,
    is_corresponding BOOLEAN DEFAULT FALSE
);

CREATE TABLE manuscript_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    stage_id INTEGER REFERENCES workflow_stages(id),
    changed_by UUID REFERENCES users(id),
    remarks TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TYPE review_assignment_status AS ENUM (
    'assigned',
    'accepted',
    'declined',
    'completed'
);


CREATE TABLE review_assignments (
  id INT UUID PRIMARY KEY,
  manuscript_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  assigned_by INT NOT NULL, -- AE or EIC user id
  due_date DATE NOT NULL,
  review_status ENUM('assigned','completed','overdue') DEFAULT 'assigned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(uui),
  FOREIGN KEY (assigned_by) REFERENCES users(uuid)
);
CREATE TABLE manuscript_stage_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  manuscript_id INT NOT NULL,
  stage_id INT NOT NULL,
  changed_by INT NOT NULL, -- AE/EIC id
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id),
  FOREIGN KEY (stage_id) REFERENCES stages(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);


CREATE TYPE review_recommendation AS ENUM (
    'accept',
    'minor_revision',
    'major_revision',
    'reject'
);


CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_assignment_id UUID REFERENCES review_assignments(id) ON DELETE CASCADE,
    recommendation review_recommendation NOT NULL,
    comment_to_author TEXT,
    confidential_comment_to_editor TEXT,
    score_originality INTEGER CHECK (score_originality BETWEEN 1 AND 5),
    score_quality INTEGER CHECK (score_quality BETWEEN 1 AND 5),
    score_clarity INTEGER CHECK (score_clarity BETWEEN 1 AND 5),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    revision_number INTEGER NOT NULL,
    submitted_by UUID REFERENCES users(id),
    response_to_reviewers TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TYPE file_type AS ENUM (
    'original',
    'revision',
    'supplementary'
);


CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    revision_id UUID REFERENCES revisions(id) ON DELETE SET NULL,
    file_type file_type NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TYPE decision_type AS ENUM (
    'accept',
    'reject',
    'revision'
);


CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    decision decision_type NOT NULL,
    decision_by UUID REFERENCES users(id),
    decision_comment TEXT,
    decision_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_manuscripts_status ON manuscripts(status);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_manuscript_stage_history_manuscript ON manuscript_stage_history(manuscript_id);
