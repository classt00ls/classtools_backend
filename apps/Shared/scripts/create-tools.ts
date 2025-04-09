/* eslint-disable no-console */
import "reflect-metadata";

import { PostgresConnection } from "./PostgresConnection";

// Eliminamos la importación de tools.json

async function main(
	pgConnection: PostgresConnection,
	toolsData: any[]
): Promise<void> {
	await Promise.all(
		toolsData.map(async (jsonTool) => {

			await pgConnection.sql`
				INSERT INTO classtools.tools (id, name, excerpt, description)
				VALUES (
				${jsonTool.id}, 
				${jsonTool.name}, 
				${jsonTool.excerpt}, 
				${jsonTool.description}
			)`;
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

async function run() {
	// En lugar de usar tools importados, creamos un array con datos de ejemplo
	const toolsData = [
		{
			id: "example-id",
			name: "Example Tool",
			excerpt: "This is an example tool",
			description: "This is a detailed description of an example tool"
		}
	];

	main(pgConnection, toolsData)
		.catch((error) => {
			console.error(error);
			process.exit(1);
		})
		.finally(async () => {
			await pgConnection.end();
			console.log("Done!");

			process.exit(0);
		});
}

run();
