CREATE TABLE ebook_authors (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(uuid) ON DELETE CASCADE,
    biography TEXT,
    affiliation VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
CREATE TABLE ebooks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    keywords TEXT[],
    status VARCHAR(50) DEFAULT 'draft', -- draft, under_review, accepted, published
    editor_id UUID REFERENCES users(uuid), -- Book Editor handling it
    finance_clearance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE ebook_author_mapping (
    id UUID PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES ebook_authors(id) ON DELETE CASCADE,
    contribution_order INT DEFAULT 1 -- to preserve author order
);

CREATE TABLE peer_reviews (
    id UUID PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(uuid),
    review_comments TEXT,
    recommendation VARCHAR(50), -- accept, minor_revision, major_revision, reject
    reviewed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE digital_production (
    id UUID PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    file_pdf VARCHAR(255),
    file_epub VARCHAR(255),
    isbn VARCHAR(50),
    doi VARCHAR(100),
    access_level VARCHAR(50) DEFAULT 'open', -- open, restricted, embargo
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE financial_clearance (
    id UUID PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
    bpc_amount NUMERIC(10,2),
    paid BOOLEAN DEFAULT FALSE,
    waiver_requested BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(uuid), -- Finance officer
    approved_at TIMESTAMP
);

CREATE TABLE reader_access_logs (
    id UUID PRIMARY KEY,
    ebook_id UUID REFERENCES ebooks(id),
    user_id UUID REFERENCES users(uuid),
    action VARCHAR(50), -- view, download
    timestamp TIMESTAMP DEFAULT NOW()
);