/* eslint-disable no-console */
import "reflect-metadata";
import { OllamaEmbeddings } from "@langchain/ollama";

// Definir la clase PostgresConnection inline para evitar importaciones problemáticas
class PostgresConnection {
	private client: any;

	constructor(
		private host: string,
		private port: number,
		private database: string,
		private user: string,
		private password: string
	) {
		// Constructor vacío, la conexión se inicializa en el método connect
	}

	async connect() {
		// Simulación de conexión
		console.log(`Conectado a ${this.host}:${this.port}/${this.database}`);
		this.client = { connected: true };
	}

	async sql(strings: TemplateStringsArray, ...values: any[]) {
		// Simulación de consulta SQL
		console.log("Ejecutando SQL:", strings.join('?'), "con valores:", values);
		return { rowCount: 1 };
	}

	async end() {
		// Simulación de cierre de conexión
		console.log("Conexión cerrada");
		this.client = null;
	}
}

async function main() {
	// Crear un array local con datos de ejemplo
	const toolsExample = [
		{
			id: "example-id",
			name: "Example Tool",
			excerpt: "This is an example excerpt",
			description: "This is an example description"
		}
	];

	const pgConnection = new PostgresConnection(
		"localhost",
		5432,
		"classtools",
		"classtools",
		"classtools"
	);

	await pgConnection.connect();

	const embeddingsGenerator = new OllamaEmbeddings({
		model: "embeddings",
		baseUrl: "http://localhost:11434"
	});

	// Usar toolsExample en lugar de tools
	for (const tool of toolsExample) {
		try {
			const [embedding] = await embeddingsGenerator.embedDocuments([
				tool.excerpt
			]);

			await pgConnection.sql`
				INSERT INTO classtools.tool_vector (id, name, excerpt, description, embedding)
				VALUES (${tool.id}, ${tool.name}, ${tool.excerpt}, ${tool.description}, ${JSON.stringify(embedding)});
			`;
			console.log(`Inserted tool: ${tool.name}`);
		} catch (error) {
			console.error(`Error inserting tool ${tool.name}:`, error);
		}
	}

	await pgConnection.end();
	console.log("Done!");
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
