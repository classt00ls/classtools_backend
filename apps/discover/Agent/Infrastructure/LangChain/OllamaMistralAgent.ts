// agent.ts

process.env.POSTGRES_URL = "postgres://user:password@localhost:5432/memoria";

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { BufferMemory } from "langchain/memory";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import {
	DistanceStrategy,
	PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";

import { StructuredTool } from "langchain/tools";
import { z } from "zod";
import { PoolConfig, Pool } from "pg";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

async function main(vectorStorePromise: Promise<PGVectorStore>): Promise<void> {
	// const directoryLoader = new DirectoryLoader("./misc/docs", {
	// 	".pdf": (path: string): PDFLoader => new PDFLoader(path),
	// });
    const pool = new Pool({
        connectionString: "postgresql://user:password@localhost:5434/testdb"
      });
      
      const checkpointer = new PostgresSaver(pool);

      // NOTE: you need to call .setup() the first time you're using your checkpointer

await checkpointer.setup();

	const vectorStore = await vectorStorePromise;

	await vectorStore.addDocuments(documents);
	await vectorStore.end();
}

// Memoria persistente en PostgreSQL para contexto largo
const vectorStore = PGVectorStore.initialize(
	new OllamaEmbeddings({
		model: "nomic-embed-text",
		baseUrl: "http://localhost:11434",
	}),
	{
		postgresConnectionOptions: {
			type: "postgres",
			host: "localhost",
			port: 5431,
			user: "classtools",
			password: "classtools",
			database: "classtools",
		} as PoolConfig,
		tableName: "classtools.posts",
		columns: {
			idColumnName: "id",
			// Con esto se generará en embedding
			contentColumnName: "content",
			// Esta columna la crea langchain
			metadataColumnName: "metadata",
			// El vector de busqueda
			vectorColumnName: "embedding",
		},
		distanceStrategy: "cosine" as DistanceStrategy,
	},
);

class StockPriceTool extends StructuredTool {
  name = "stock_price";
  description = "Obtiene el precio de una acción en la bolsa";

  // Definir el esquema de entrada
  schema = z.object({
    symbol: z.string().describe("Símbolo de la acción (Ej: AAPL, TSLA)")
  });

  async _call({ symbol }: { symbol: string }) {
    // Aquí podrías llamar a una API real como Yahoo Finance o Alpha Vantage
    return `El precio de ${symbol} es $150 (ejemplo)`;
  }
}

class CatFactsTool extends StructuredTool {
  name = "cat_facts";
  description = "Proporciona datos curiosos sobre gatos";

  // No necesita parámetros, así que pasamos un esquema vacío
  schema = z.object({});

  async _call() {
    return "Los gatos pueden hacer hasta 100 sonidos diferentes.";
  }
}


// Definir herramientas disponibles
const tools = [
  new TavilySearchResults({ maxResults: 3 }), // Búsqueda en la web
  new StockPriceTool(),
  new CatFactsTool(),
];
const toolNode = new ToolNode(tools);

// Modelo de lenguaje (Ollama en local)
const model = new ChatOllama({
  model: "mistral", // Modelo potente en Ollama
  temperature: 0.2,
}).bindTools(tools); // 🔹 Asociamos las tools al modelo

// Memoria en RAM para conversaciones cortas
const bufferMemory = new BufferMemory();

// Función para decidir qué memoria usar
async function getMemory(messages: any) {
  return messages.length < 5 ? bufferMemory : vectorStore;
}

// Función que decide si el modelo usa tools o no
function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
  return lastMessage.tool_calls?.length ? "tools" : "__end__";
}

// Función para llamar al modelo y guardar memoria
async function callModel(state: typeof MessagesAnnotation.State) {
  await vectorStore.saveContext(state.messages);
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

// Definir flujo con LangGraph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addNode("tools", toolNode)
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// Compilar el flujo
const app = workflow.compile();

// Consultas de prueba
const finalState = await app.invoke({
  messages: [new HumanMessage("¿Qué tiempo hace en Madrid?")],
});
console.log(finalState.messages[finalState.messages.length - 1].content);

const stockState = await app.invoke({
  messages: [new HumanMessage("¿Cuánto vale la acción de Tesla?")],
});
console.log(stockState.messages[stockState.messages.length - 1].content);

const catState = await app.invoke({
  messages: [new HumanMessage("Dime un dato sobre gatos")],
});
console.log(catState.messages[catState.messages.length - 1].content);
