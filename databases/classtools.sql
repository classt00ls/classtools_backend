CREATE SCHEMA classtools;

CREATE TABLE classtools.tool_vector (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
	description TEXT NULL,
    -- 768 dimensiones
	embedding vector(768)
);


CREATE TABLE tool_es (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    name VARCHAR(255),
    description TEXT,
    excerpt TEXT,
    link VARCHAR(255),
    url VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    uploaded BOOLEAN DEFAULT false,
    status VARCHAR(50),
    features TEXT,
    stars INTEGER,
    pricing VARCHAR(255),
    html TEXT,
    video_html TEXT,
    video_url VARCHAR(255),
    pros_and_cons TEXT,
    ratings TEXT
);

-- Tabla para inglés (misma estructura)
CREATE TABLE tool_en (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    name VARCHAR(255),
    description TEXT,
    excerpt TEXT,
    link VARCHAR(255),
    url VARCHAR(255),
    deleted BOOLEAN DEFAULT false,
    uploaded BOOLEAN DEFAULT false,
    status VARCHAR(50),
    features TEXT,
    stars INTEGER,
    pricing VARCHAR(255),
    html TEXT,
    video_html TEXT,
    video_url VARCHAR(255),
    pros_and_cons TEXT,
    ratings TEXT
);

CREATE TABLE IF NOT EXISTS event_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    retries INTEGER DEFAULT 0
);