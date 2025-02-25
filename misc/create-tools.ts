/* eslint-disable no-console */
import "reflect-metadata";

import { OllamaEmbeddings } from "@langchain/ollama";

import { PostgresConnection } from "./PostgresConnection";

// import tools from "./tools.json";
import * as tools from './tools.json';

async function main(
	pgConnection: PostgresConnection,
	embeddingsGenerator: OllamaEmbeddings,
): Promise<void> {
	await Promise.all(
		tools.map(async (jsonTool) => {
			const [embedding] = await embeddingsGenerator.embedDocuments([
				jsonTool.excerpt,
			]);

			await pgConnection.sql`
				INSERT INTO classtools.tool_vector (id, name, excerpt, description, embedding)
				VALUES (${jsonTool.id}, ${jsonTool.name}, ${jsonTool.excerpt}, ${jsonTool.description}, ${JSON.stringify(embedding)});
			`;
		}),
	);
}

const pgConnection = new PostgresConnection(
	"localhost",
	5431,
	"classtools",
	"classtools",
	"classtools",
);

const embeddingsGenerator = new OllamaEmbeddings({
	model: "nomic-embed-text",
	baseUrl: "http://localhost:11434",
});

main(pgConnection, embeddingsGenerator)
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await pgConnection.end();
		console.log("Done!");

		process.exit(0);
	});
