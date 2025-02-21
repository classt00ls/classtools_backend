CREATE SCHEMA classtools;

CREATE TABLE classtools.tools (
	id VARCHAR(255) PRIMARY KEY NOT NULL,
	name VARCHAR(155) NOT NULL,
	excerpt VARCHAR(355) NOT NULL,
	description TEXT NULL
);