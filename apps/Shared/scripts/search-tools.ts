/* eslint-disable no-console */
import "reflect-metadata";

import { PostgresConnection } from "./PostgresConnection";

async function main(
	query: string,
	pgConnection: PostgresConnection
): Promise<void> {
	console.log(`For the query "${query}" entramos TETE`);
	const results = await pgConnection.sql`
	SELECT
		name,
		description,
		excerpt,
		embedding <=>  ai.ollama_embed('nomic-embed-text', ${query}, host => 'http://host.docker.internal:11434') as distance
	FROM classtools.tools_embedding
	ORDER BY distance
	LIMIT 3;
`;

console.log(`For the query "${query}" the results are:`, results);
}

const pgConnection = new PostgresConnection();

main(process.argv[2], pgConnection)
.catch(console.error)
.finally(async () => {
	await pgConnection.end();

	process.exit(0);
});


