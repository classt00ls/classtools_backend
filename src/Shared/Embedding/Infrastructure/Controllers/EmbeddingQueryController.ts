import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetEmbeddingResponseCommand } from '../../Application/respond/GetEmbeddingResponseCommand';
import { EmbeddingResponse, EmbeddingResponseOptions } from '../../Domain/EmbeddingResponseService';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * DTO para realizar consultas a embeddings con opciones de filtrado
 * 
 * Ejemplos de solicitudes:
 * 
 * 1. Consulta básica:
 * ```json
 * {
 *   "query": "¿Qué son los embeddings?"
 * }
 * ```
 * 
 * 2. Con filtro de metadatos:
 * ```json
 * {
 *   "query": "¿Cuáles son las mejores prácticas para crear embeddings?",
 *   "options": {
 *     "limit": 10,
 *     "metadataFilter": {
 *       "category": "best-practices",
 *       "tags": { "$in": ["embeddings", "vector-db"] }
 *     }
 *   }
 * }
 * ```
 * 
 * 3. Con systemPrompt para respuestas técnicas:
 * ```json
 * {
 *   "query": "¿Cómo optimizar la búsqueda por similitud?",
 *   "options": {
 *     "systemPrompt": "Eres un experto técnico en bases de datos vectoriales. Proporciona respuestas detalladas con ejemplos de código y técnicas específicas."
 *   }
 * }
 * ```
 * 
 * 4. Con systemPrompt para respuestas sencillas:
 * ```json
 * {
 *   "query": "¿Qué es RAG?",
 *   "options": {
 *     "systemPrompt": "Eres un tutor que explica conceptos complejos de manera sencilla. Utiliza analogías y evita la jerga técnica innecesaria."
 *   }
 * }
 * ```
 * 
 * 5. Combinando varias opciones:
 * ```json
 * {
 *   "query": "Extrae los puntos clave sobre implementación de embeddings",
 *   "options": {
 *     "limit": 15,
 *     "temperature": 0.2,
 *     "metadataFilter": {
 *       "category": "implementation"
 *     },
 *     "systemPrompt": "Eres un asistente que organiza información de manera estructurada. Presenta los puntos clave en una lista numerada, agrupados por temas, y añade una breve conclusión al final."
 *   }
 * }
 * ```
 */
class EmbeddingQueryDto {
  query: string;
  options?: EmbeddingResponseOptions;
}

@ApiTags('Embeddings')
@Controller('api/embeddings')
export class EmbeddingQueryController {
  constructor(private readonly commandBus: CommandBus) {}

  /**
   * Endpoint para realizar consultas basadas en embeddings con RAG
   * 
   * @param body Contiene la consulta y opciones opcionales
   * @returns La respuesta generada por el servicio RAG
   */
  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza una consulta usando RAG sobre embeddings' })
  @ApiBody({ type: EmbeddingQueryDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Respuesta generada basada en los embeddings encontrados' 
  })
  async query(@Body() body: EmbeddingQueryDto): Promise<EmbeddingResponse> {
    const { query, options } = body;
    
    // Usamos el comando para obtener la respuesta
    return this.commandBus.execute(
      new GetEmbeddingResponseCommand(query, options)
    );
  }
} 