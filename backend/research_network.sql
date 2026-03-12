CREATE TABLE researcher_profiles (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(uuid) ON DELETE CASCADE,
    full_name TEXT,
    affiliation TEXT,
    country TEXT,
    bio TEXT,
    research_interests TEXT[],
    orcid TEXT,
    website TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE publications (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(uuid),
    title TEXT,
    abstract TEXT,
    journal TEXT,
    year INT,
    doi TEXT,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE connections (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(uuid),
    receiver_id UUID REFERENCES users(uuid),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE research_groups (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    description TEXT,
    created_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE group_members (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES research_groups(uuid),
    user_id UUID REFERENCES users(uuid),
    role VARCHAR(20) DEFAULT 'member',
    status VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE group_posts (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES research_groups(uuid),
    user_id UUID REFERENCES users(uuid),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE conversations (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE messages (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(uuid),
    sender_id UUID REFERENCES users(uuid),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE events (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    event_date DATE,
    location TEXT,
    created_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE notifications (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(uuid),
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE groups (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(uuid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE group_members (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(uuid),
    user_id UUID REFERENCES users(uuid),
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (group_id, user_id),
    FOREIGN KEY (group_id) REFERENCES groups(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE group_invitations (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(uuid),
    inviter_id UUID REFERENCES users(uuid),
    invitee_email VARCHAR(255),
    invitee_user_id UUID REFERENCES users(uuid),
    status VARCHAR(20) DEFAULT 'pending',
    token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(uuid) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (invitee_user_id) REFERENCES users(uuid) ON DELETE SET NULL
);

CREATE TABLE group_documents (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(uuid),
    uploaded_by UUID REFERENCES users(uuid),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(uuid) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE document_feedback (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES group_documents(uuid),
    user_id UUID REFERENCES users(uuid),
    comment TEXT NOT NULL,
    feedback_type VARCHAR(20) DEFAULT 'comment',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id) REFERENCES group_documents(uuid) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);


-- =====================================================
-- PUBLICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS publications (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  authors TEXT[],
  journal VARCHAR(500),
  year INTEGER,
  doi VARCHAR(200),
  abstract TEXT,
  file_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS publication_likes (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES publications(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(publication_id, user_id)
);

CREATE TABLE IF NOT EXISTS publication_comments (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES publications(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MESSAGING
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(uuid) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PROJECT UPDATES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_updates (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- GROUP POSTS (FORUM)
-- =====================================================
CREATE TABLE IF NOT EXISTS group_posts (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_post_likes (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES group_posts(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_post_comments (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES group_posts(uuid) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_publications_user_id ON publications(user_id);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_publication_likes_publication_id ON publication_likes(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_comments_publication_id ON publication_comments(publication_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

CREATE INDEX IF NOT EXISTS idx_project_updates_group_id ON project_updates(group_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_user_id ON project_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON project_updates(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_user_id ON group_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON group_posts(created_at DESC);