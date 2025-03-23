import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetEmbeddingResponseCommand } from '../../../src/Shared/Embedding/Application/respond/GetEmbeddingResponseCommand';
import { EmbeddingResponse, EmbeddingResponseOptions } from '../../../src/Shared/Embedding/Domain/EmbeddingResponseService';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * DTO para realizar consultas a embeddings
 */
class TestingQueryDto {
  /** La consulta en lenguaje natural */
  query: string;
  
  /** Opciones opcionales para personalizar la respuesta */
  options?: EmbeddingResponseOptions;
}

/**
 * Controlador para probar las funcionalidades del módulo de Embedding
 */
@ApiTags('Testing')
@Controller('api/testing')
export class TestingController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Endpoint para probar la funcionalidad RAG con embeddings
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async index(): Promise<string> {
    return `
      <h1>Testing de Embedding Module</h1>
      <p>Utiliza el endpoint POST /api/testing/query para probar las capacidades RAG</p>
      <p>Ejemplo de body:</p>
      <pre>
      {
        "query": "¿Qué son los embeddings vectoriales?",
        "options": {
          "limit": 5,
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
} 