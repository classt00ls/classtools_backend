SELECT ai.create_vectorizer(
	'classtools.tools'::regclass,
	embedding => ai.embedding_ollama('nomic-embed-text', 768),
	chunking => ai.chunking_character_text_splitter('description', 128, 10),
	formatting => ai.formatting_python_template('Name: $name | Description: $chunk | Excerpt: $excerpt | Categories: $categories')
);
