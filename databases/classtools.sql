CREATE SCHEMA classtools;

CREATE TABLE classtools.tools (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
	name VARCHAR(255) NOT NULL,
    -- 768 dimensiones
	embedding vector(768)
);