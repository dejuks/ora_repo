CREATE TABLE wiki_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status wiki_article_status DEFAULT 'draft',
    created_by UUID NOT NULL,
    current_revision_id UUID,
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON wiki_articles(slug);
CREATE INDEX idx_articles_status ON wiki_articles(status);
CREATE INDEX idx_articles_created_by ON wiki_articles(created_by);

-- 3. WIKI REVISIONS (Version Control)
CREATE TABLE wiki_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    summary TEXT,
    version INT NOT NULL,
    edited_by UUID NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(article_id, version)
);

CREATE INDEX idx_revisions_article ON wiki_revisions(article_id);
CREATE INDEX idx_revisions_current ON wiki_revisions(is_current);

CREATE TABLE wiki_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL
);

-- 5. ARTICLE CATEGORIES (Many-to-Many)
CREATE TABLE wiki_article_categories (
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES wiki_categories(id) ON DELETE CASCADE,
    PRIMARY KEY(article_id, category_id)
);

-- 6. MEDIA
CREATE TABLE wiki_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES wiki_articles(id) ON DELETE SET NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    uploaded_by UUID,
    license VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);




-- Add vandalism reports table
CREATE TABLE IF NOT EXISTS wiki_vandalism_reports (
    id SERIAL PRIMARY KEY,
    article_id INTEGER REFERENCES wiki_articles(id) ON DELETE CASCADE,
    revision_id INTEGER REFERENCES wiki_revisions(id),
    reported_by UUID REFERENCES users(uuid),
    report_reason TEXT NOT NULL,
    report_details JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, dismissed, action_taken
    reviewed_by UUID REFERENCES users(uuid),
    reviewed_at TIMESTAMP,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Add vandalism reports table
CREATE TABLE IF NOT EXISTS wiki_vandalism_reports (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    revision_id UUID REFERENCES wiki_revisions(id),
    reported_by UUID REFERENCES users(uuid),
    report_reason TEXT NOT NULL,
    report_details JSONB,
    status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, dismissed, action_taken
    reviewed_by UUID REFERENCES users(uuid),
    reviewed_at TIMESTAMP,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Add article protection table
CREATE TABLE IF NOT EXISTS wiki_article_protection (
    id SERIAL PRIMARY KEY,
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    protection_level VARCHAR(20) NOT NULL, -- semi, full
    protected_by UUID REFERENCES users(uuid),
    protected_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    reason TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Add indexes
CREATE INDEX idx_vandalism_status ON wiki_vandalism_reports(status);
CREATE INDEX idx_vandalism_article ON wiki_vandalism_reports(article_id);
CREATE INDEX idx_protection_article ON wiki_article_protection(article_id) WHERE is_active = true;



-- 7. PAGE PROTECTION (For Admins)
CREATE TABLE wiki_page_protection (
    article_id UUID PRIMARY KEY REFERENCES wiki_articles(id) ON DELETE CASCADE,
    level protection_level DEFAULT 'none',
    protected_by UUID,
    expires_at TIMESTAMP,
    reason TEXT
);

-- 8. ARTICLES FOR DELETION (AfD) DISCUSSIONS
CREATE TABLE wiki_deletion_discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    nominated_by UUID NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    closed_by UUID,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);


-- 9. DELETION COMMENTS
CREATE TABLE wiki_deletion_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id UUID NOT NULL REFERENCES wiki_deletion_discussions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    vote VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. USER CONTRIBUTIONS
CREATE TABLE wiki_user_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    article_id UUID REFERENCES wiki_articles(id) ON DELETE CASCADE,
    revision_id UUID REFERENCES wiki_revisions(id) ON DELETE CASCADE,
    action VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_contributions_user ON wiki_user_contributions(user_id);


-- 12. WATCHLIST
CREATE TABLE wiki_watchlist (
    user_id UUID NOT NULL,
    article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(user_id, article_id)
);

-- 13. AUDIT LOGS (For Oversight)
CREATE TABLE wiki_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    target_type VARCHAR(20),
    target_id UUID,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. USER BLOCKS
CREATE TABLE wiki_user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_user_id UUID NOT NULL,
    blocked_by UUID NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);