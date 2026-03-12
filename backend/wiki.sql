CREATE TABLE wiki_articles (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'om', -- om, en
    status VARCHAR(30) DEFAULT 'draft', -- draft, pending, published
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wiki_revisions (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES wiki_articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    edited_by BIGINT REFERENCES users(id),
    revision_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wiki_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE wiki_article_categories (
    article_id BIGINT REFERENCES wiki_articles(id),
    category_id BIGINT REFERENCES wiki_categories(id),
    PRIMARY KEY (article_id, category_id)
);


CREATE TABLE wiki_moderation_logs (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT REFERENCES wiki_articles(id),
    moderator_id BIGINT REFERENCES users(id),
    action VARCHAR(50), -- approve, reject, delete, protect
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);