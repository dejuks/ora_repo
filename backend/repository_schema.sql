CREATE TABLE repository_items (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    abstract TEXT,
    item_type VARCHAR(50), -- article, thesis, dataset, report
    language VARCHAR(50),
    doi VARCHAR(100),
    handle VARCHAR(100),
    access_level VARCHAR(30) DEFAULT 'open', -- open, restricted, embargoed
    embargo_until DATE,
    submitter_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'submitted', -- submitted, under_review, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repository_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_item_id BIGINT NOT NULL
        REFERENCES repository_items(id)
        ON DELETE CASCADE,

    file_name TEXT,
    file_type VARCHAR(50),
    file_path TEXT NOT NULL,
    is_preservation_copy BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repository_authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    repository_item_id BIGINT NOT NULL
        REFERENCES repository_items(id)
        ON DELETE CASCADE,

    author_name VARCHAR(255),
    author_orcid VARCHAR(50),
    affiliation VARCHAR(255)
);


CREATE TABLE repository_item_tags (
    repository_item_id BIGINT NOT NULL
        REFERENCES repository_items(id)
        ON DELETE CASCADE,

    tag_id UUID NOT NULL
        REFERENCES tags(id)
        ON DELETE CASCADE,

    PRIMARY KEY (repository_item_id, tag_id)
);


CREATE TABLE repository_reviews (
    id BIGSERIAL PRIMARY KEY,
    repository_item_id BIGINT REFERENCES repository_items(id),
    reviewer_id UUID REFERENCES users(uuid) ON DELETE SET NULL,
    comments TEXT,
    recommendation VARCHAR(30), -- approve, revise, reject
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE repository_item_vocabulary (
  id BIGINT REFERENCES repository_items(id),
  word TEXT,
  frequency INT
);

CREATE TABLE repository_item_checks (
  id BIGINT REFERENCES repository_items(id),
  similarity_score FLOAT,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
