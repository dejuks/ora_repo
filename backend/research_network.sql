CREATE TABLE researcher_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id),
    bio TEXT,
    research_interests TEXT,
    google_scholar_url TEXT,
    linkedin_url TEXT,
    visibility VARCHAR(30) DEFAULT 'public'
);

CREATE TABLE research_groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE research_group_members (
    group_id BIGINT REFERENCES research_groups(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    role VARCHAR(30) DEFAULT 'member', -- moderator, member
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE research_posts (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES research_groups(id),
    author_id BIGINT REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT REFERENCES users(id),
    receiver_id BIGINT REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);