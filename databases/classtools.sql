CREATE SCHEMA classtools;

CREATE TABLE classtools.tool_vector (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
	name VARCHAR(155) NOT NULL,
	excerpt VARCHAR(355) NOT NULL,
	description TEXT NULL,
    -- 768 dimensiones
	embedding vector(768)
);