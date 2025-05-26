import { Controller, Post, Body, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetEmbeddingResponseCommand } from '../../../src/Shared/Embedding/Application/respond/GetEmbeddingResponseCommand';
import { EmbeddingResponse } from '../../../src/Shared/Embedding/Domain/EmbeddingResponseService';
import { EmbeddingResponseOptions } from '../../../src/Shared/Embedding/Domain/EmbeddingResponseOptions';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagesAnnotation, Annotation } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { ToolsSearchResponse } from './dtos/tools-search.response';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { ToolRepository } from 'src/backoffice/Tool/Domain/tool.repository';

// Definimos el tipo de estado que usa nuestro agente
const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  searchType: Annotation<'id_search' | 'semantic_search'>,
});

/**
 * DTO para realizar consultas a embeddings
 */
class TestingQueryDto {
  /** La consulta para la búsqueda de embeddings */
  query: string;
  
  /** Opciones opcionales para personalizar la respuesta */
  options?: EmbeddingResponseOptions;
}

@Controller('api/testing')
export class TestingController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('TOOL_RECOMMENDER') private readonly app: any,
    private readonly toolRepository: ToolRepository
  ) {}

  /**
   * Endpoint para probar la funcionalidad RAG con embeddings
   */
  @Get('')
  @HttpCode(HttpStatus.OK)
  async index(): Promise<string> {
    return `
      <h1>Testing de Embedding Module</h1>
      <p>Utiliza el endpoint POST /api/testing/query para probar las capacidades RAG</p>
      <p>Ejemplo de body básico:</p>
      <pre>
      {
        "query": "¿Qué son los embeddings vectoriales?",
        "options": {
          "limit": 5,
          "temperature": 0.7
        }
      }
      </pre>
      <p>Ejemplo con queries diferenciadas:</p>
      <pre>
      {
        "query": "embeddings vectoriales pgvector cosine similarity",
        "options": {
          "llmQuery": "Explica de manera simple y didáctica qué son los embeddings vectoriales y cómo funcionan",
          "temperature": 0.7
        }
      }
      </pre>
    `;
  }

  /**
   * Endpoint para realizar consultas RAG
   * 
   * @param body Contiene la consulta y opciones opcionales
   * @returns La respuesta generada usando RAG
   */
  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza una consulta RAG sobre embeddings' })
  @ApiBody({ type: TestingQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta generada basada en los embeddings encontrados' 
  })
  async query(@Body() body: TestingQueryDto): Promise<EmbeddingResponse> {
    const { query, options } = body;
    
    // Ejemplo de cómo usar el módulo de Embedding a través del CommandBus
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, options)
    );
  }

  /**
   * Endpoint para demostrar el uso de queries diferenciadas
   */
  @Post('queries-diferenciadas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demuestra el uso de queries diferenciadas para búsqueda y LLM' })
  async queriesDiferenciadas(@Body() body: TestingQueryDto): Promise<EmbeddingResponse> {
    const { query } = body;
    
    // Ejemplo de cómo usar queries diferenciadas
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, {
        limit: 10,
        metadataFilter: { 
          type: "documentation"
        },
        llmQuery: "Basándote únicamente en el contexto proporcionado, explica este tema de manera didáctica, como si estuvieras enseñando a un estudiante. Incluye analogías y ejemplos prácticos.",
        temperature: 0.7
      })
    );
  }

  /**
   * Endpoint para probar la búsqueda de embeddings con filtros
   */
  @Post('filter-example')
  @HttpCode(HttpStatus.OK)
  async filterExample(@Body() body: TestingQueryDto): Promise<EmbeddingResponse> {
    const { query } = body;
    
    // Ejemplo de cómo usar filtros de metadatos y prompts de sistema
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, {
        limit: 10,
        metadataFilter: { 
          type: "documentation",
          tags: { $in: ["embedding", "vector"] }
        },
        systemPrompt: "Eres un experto técnico en embeddings y bases de datos vectoriales. Proporciona respuestas detalladas y técnicamente precisas."
      })
    );
  }

  /**
   * Endpoint para demostrar respuestas concisas
   */
  @Post('concise')
  @HttpCode(HttpStatus.OK)
  async conciseResponse(@Body() body: TestingQueryDto): Promise<EmbeddingResponse> {
    const { query } = body;
    
    // Ejemplo de cómo generar respuestas concisas
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, {
        temperature: 0.3,
        systemPrompt: "Eres un asistente eficiente. Proporciona respuestas breves, precisas y directas. Limita tu respuesta a 3-5 oraciones como máximo."
      })
    );
  }

  /**
   * Endpoint para demostrar respuestas para principiantes
   */
  @Post('beginner-friendly')
  @HttpCode(HttpStatus.OK)
  async beginnerFriendly(@Body() body: TestingQueryDto): Promise<EmbeddingResponse> {
    const { query } = body;
    
    // Ejemplo de cómo generar respuestas orientadas a principiantes
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, {
        temperature: 0.7,
        systemPrompt: "Eres un tutor paciente especializado en explicar conceptos complejos de manera sencilla. Utiliza analogías y ejemplos cotidianos para explicar conceptos técnicos."
      })
    );
  }

  /**
   * Endpoint para probar el agente recomendador de herramientas
   * Devuelve un array de herramientas con sus detalles
   */
  @Post('tool-recommender')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Prueba el agente recomendador de herramientas' })
  @ApiBody({ type: TestingQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Array de herramientas recomendadas con sus detalles',
    type: ToolsSearchResponse
  })
  @Serialize(ToolsSearchResponse)
  async recommendTools(@Body() body: TestingQueryDto): Promise<ToolsSearchResponse> {
    const { query } = body;
    
    // Invocamos el grafo con el mensaje del usuario
    const state = await this.app.invoke({
      messages: [new HumanMessage(query)]
    });

    // Obtenemos el contenido del último mensaje (que será el array de IDs)
    const lastMessage = state.messages[state.messages.length - 1];
    const toolIds = JSON.parse(lastMessage.content);

    // Recuperamos los detalles de cada herramienta
    const tools = await Promise.all(
      toolIds.map(async (id: string) => {
        const tool = await this.toolRepository.getOne(id);
        return tool;
      })
    );

    return { tools };
  }
} 