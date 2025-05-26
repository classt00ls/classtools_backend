/**
 * Este agente es un recomendador de herramientas que:
 * 1. Recibe consultas de usuarios
 * 2. Busca herramientas relevantes usando embeddings vectoriales
 * 3. Genera respuestas contextualizadas con las herramientas recomendadas
 * 
 * Usa LangGraph para manejar el flujo de estados y decisiones
 */

import { StateGraph, MessagesAnnotation, Annotation } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { EmbeddingsProviderFactory } from "../../Embedding/Infrastructure/EmbeddingsProviderFactory";
import { ConfigService } from "@nestjs/config";
import { LangChainEmbeddingRepository } from "@Shared/Embedding/Infrastructure/Persistence/Langchain/LangChainEmbeddingRepository";
import { OpenAIEmbeddings } from "@langchain/openai";

// Configuración del modelo de lenguaje
const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0,
});

// Definición del estado del grafo
// Incluye el estado de mensajes por defecto y nuestro campo personalizado searchType
const StateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    searchType: Annotation<'id_search' | 'semantic_search'>,
    searchContext: Annotation<{
      mentionedTools: string[];
      toolType: string;
      searchPrompt: string;
    }>
});

// Configuración de la base de datos y embeddings
const configService = new ConfigService();
const embeddingsGenerator = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'text-embedding-ada-002'
});

// Configuración del almacenamiento vectorial en PostgreSQL
const vectorStore = new PGVectorStore(embeddingsGenerator, {
  postgresConnectionOptions: {
    connectionString: 'postgresql://postgres.mrdvfjqdmxqmrtzhhfms:tz1D6kj9CNHwHGJA@aws-0-eu-central-1.pooler.supabase.com:5432/postgres',
  },
  tableName: 'embeddings',
  columns: {
    idColumnName: 'id',
    contentColumnName: 'content',
    metadataColumnName: 'metadata',
    vectorColumnName: 'embedding',
  },
  distanceStrategy: 'cosine',
});

// Repositorio para manejar las operaciones de embeddings
const embeddingRepository = new LangChainEmbeddingRepository(vectorStore, embeddingsGenerator);

/**
 * Función para analizar la consulta y determinar el tipo de búsqueda
 * Usa el LLM para:
 * 1. Extraer la lista de herramientas mencionadas en la consulta
 * 2. Preparar un prompt para buscar herramientas similares
 */
async function analyzeQuery(state: typeof StateAnnotation.State) {
  const lastMessage = state.messages.at(-1);
  const query = typeof lastMessage.content === 'string' ? lastMessage.content : '';

  const response = await llm.invoke([
    ...state.messages,
    new HumanMessage(`Analiza la siguiente consulta y:
    1. Extrae una lista de herramientas mencionadas (si hay alguna)
    2. Identifica el tipo de herramientas que el usuario está buscando
    3. Prepara un prompt para buscar herramientas similares

    Responde en formato JSON con esta estructura:
    {
      "mentioned_tools": ["herramienta1", "herramienta2", ...],
      "tool_type": "descripción del tipo de herramientas",
      "search_prompt": "prompt para buscar herramientas similares"
    }

    Consulta: "${query}"`)
  ]);

  const analysis = JSON.parse(response.content as string);
  
  return { 
    messages: [response],
    searchType: 'id_search',
    searchContext: {
      mentionedTools: analysis.mentioned_tools,
      toolType: analysis.tool_type,
      searchPrompt: analysis.search_prompt
    }
  };
}

/**
 * Función para buscar herramientas
 * Usa el contexto de búsqueda para encontrar herramientas relevantes
 */
async function searchTools(state: typeof StateAnnotation.State) {
  const searchContext = state.searchContext;
  const query = searchContext.searchPrompt;

  const results = await embeddingRepository.search(query, 3);

  return { 
    messages: [
      new AIMessage(JSON.stringify(results.map(r => r.id)))
    ] 
  };
}

/**
 * Función para decidir si continuar el flujo
 * - Si el mensaje contiene "adiós", termina el flujo
 * - En caso contrario, termina después de buscar herramientas
 */
function shouldContinue(state: typeof StateAnnotation.State) {
  const lastMessage = state.messages.at(-1) as AIMessage;
  
  if (
    lastMessage._getType() === "human" &&
    typeof lastMessage.content === 'string' &&
    lastMessage.content.toLowerCase().includes("adiós")
  ) {
    return "__end__";
  }
  return "__end__";  // Siempre terminamos después de buscar herramientas
}

/**
 * Construcción del grafo de estados
 * 1. Definición de nodos:
 *    - analyze_query: Analiza la consulta y determina el tipo de búsqueda
 *    - search_tools: Realiza la búsqueda y devuelve los resultados
 * 2. Definición de conexiones:
 *    - __start__ → analyze_query: Comienza analizando la consulta
 *    - analyze_query → search_tools: Después de analizar, busca las herramientas
 *    - search_tools → (analyze_query o __end__): Decide si continuar o terminar
 */
const workflow = new StateGraph(StateAnnotation)
  // 1. Definir todos los nodos
  .addNode("analyze_query", analyzeQuery)
  .addNode("search_tools", searchTools)
  // 2. Definir todas las conexiones
  .addEdge("__start__", "analyze_query")
  .addEdge("analyze_query", "search_tools")
  .addConditionalEdges("search_tools", shouldContinue);

// Compilación del grafo para su uso
const app = workflow.compile();

export default app;