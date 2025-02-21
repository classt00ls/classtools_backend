/* eslint-disable no-console */
import "reflect-metadata";

import { PostgresConnection } from "./PostgresConnection";

// import tools from "./tools.json";
import * as tools from './../../../misc/tools.json';

async function main(
	pgConnection: PostgresConnection
): Promise<void> {
	await Promise.all(
		tools.map(async (jsonTool) => {

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


main(pgConnection)
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await pgConnection.end();
		console.log("Done!");

		process.exit(0);
	});
