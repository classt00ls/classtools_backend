/* eslint-disable no-console */
import "reflect-metadata";

import { OllamaEmbeddings } from "@langchain/ollama";

import { PostgresConnection } from "./PostgresConnection";

async function main(
	query: string,
	connection: PostgresConnection,
	embeddingsGenerator: OllamaEmbeddings,
): Promise<void> {
	const embedding = JSON.stringify(
		await embeddingsGenerator.embedQuery(query),
	);

	const results = await connection.sql`
		SELECT name
		FROM classtools.tool_vector
		ORDER BY (embedding <=> ${embedding})
		LIMIT 3;
	`;

	console.log(`For the query "${query}" the results are:`, results);
}

const pgConnection = new PostgresConnection();
const embeddingsGenerator = new OllamaEmbeddings({
	model: "nomic-embed-text",
	baseUrl: "http://localhost:11434",
});


main(process.argv[2], pgConnection, embeddingsGenerator)
.catch(console.error)
.finally(async () => {
	await pgConnection.end();

	process.exit(0);
});


