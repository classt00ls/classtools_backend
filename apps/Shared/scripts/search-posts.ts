/* eslint-disable no-console */
import "reflect-metadata";

import {
	DistanceStrategy,
	PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { pull } from "langchain/hub";
import { PoolConfig } from "pg";

async function main(
	query: string,
	vectorStorePromise: Promise<PGVectorStore>,
): Promise<void> {
	const vectorStore = await vectorStorePromise;

	// Aqui estamos preparando el setup de la cadena
	const ragChain = await createStuffDocumentsChain({
		// El modelo que va a procesar nuestra consulta
		llm: new ChatOllama({ model: "llama3.1:8b", temperature: 1 }),
		prompt: await pull<ChatPromptTemplate>("rlm/rag-prompt"),
		outputParser: new StringOutputParser(),
	});

	// Aquí ejecutamos la cadena
	const response = await ragChain.invoke({
		// El texto de consulta
		question: query,
		// Al llm le damos todo el contexto de nuestra base de datos vectorial
		// Crea el embedding dde la query, ve a la database y selecciona aquello que se le parezca
		context: await vectorStore.asRetriever().invoke(query),
	});

	console.log(response);

	await vectorStore.end();
}

const vectorStore = PGVectorStore.initialize(
	new OllamaEmbeddings({
		model: "nomic-embed-text",
		baseUrl: "http://localghost:11434",
	}),
	{
		postgresConnectionOptions: {
			type: "postgres",
			host: "localghost",
			port: 5432,
			user: "classtools",
			password: "classtools",
			database: "classtools",
		} as PoolConfig,
		tableName: "classtools.posts",
		columns: {
			idColumnName: "id",
			contentColumnName: "content",
			metadataColumnName: "metadata",
			vectorColumnName: "embedding",
		},
		distanceStrategy: "cosine" as DistanceStrategy,
	},
);

main(process.argv[2], vectorStore)
	.catch(console.error)
	.finally(async () => {
		console.log("Done!");

		process.exit(0);
	});
