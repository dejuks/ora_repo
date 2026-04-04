--- EBook Schema ---
CREATE TABLE ora_ebook_authors (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    affiliation VARCHAR(255), -- university/company
    bio TEXT,
    profile_image VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_author_user
        FOREIGN KEY (user_id)
        REFERENCES users(uuid)
        ON DELETE CASCADE
);

CREATE TABLE ora_ebook_manuscripts (
    id UUID PRIMARY KEY,

    author_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    abstract TEXT,
    file_path VARCHAR(255) NOT NULL,

    isbn VARCHAR(50),
    language VARCHAR(50) DEFAULT 'English',
    publication_year INT,

    status VARCHAR(50) DEFAULT 'submitted',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_manuscript_author
        FOREIGN KEY (author_id)
        REFERENCES ora_ebook_authors(id)
        ON DELETE CASCADE
);