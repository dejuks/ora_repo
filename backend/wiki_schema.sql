CREATE TABLE wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    language VARCHAR(10) DEFAULT 'om',
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE wiki_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    content TEXT,
    summary TEXT,
    version INT,
    edited_by UUID REFERENCES users(uuid),
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE wiki_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150),
    description TEXT
);

CREATE TABLE wiki_article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES wiki_categories(id) ON DELETE CASCADE
);


CREATE TABLE wiki_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE
);

CREATE TABLE wiki_article_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES wiki_tags(id) ON DELETE CASCADE
);


CREATE TABLE wiki_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url TEXT,
    file_type VARCHAR(50),
    uploaded_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wiki_page_protection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES wiki_articles(id),
    level VARCHAR(50),
    expires_at TIMESTAMP
);

CREATE TABLE wiki_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID,
    action VARCHAR(100),
    reason TEXT,
    performed_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wiki_user_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    article_id UUID,
    revision_id UUID,
    action VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wiki_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wiki_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT,
    target_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);