import { Injectable } from '@nestjs/common';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { pull } from 'langchain/hub';
import { ConfigService } from '@nestjs/config';

import { 
  EmbeddingResponseService, 
  EmbeddingResponseOptions, 
  EmbeddingResponse 
} from '../Domain/EmbeddingResponseService';
import { EmbeddingRepository } from '../Domain/EmbeddingRepository';

/**
 * Implementación del servicio de respuesta de embeddings usando Ollama como LLM
 * 
 * Ejemplos de uso con metadataFilter:
 * 
 * 1. Filtrar por tipo de documento:
 * ```typescript
 * // Sólo buscar en documentos técnicos
 * responseService.respond("¿Cómo configurar vectores?", {
 *   metadataFilter: { documentType: "technical" }
 * });
 * ```
 * 
 * 2. Filtrar por categoría y fecha:
 * ```typescript
 * // Buscar en documentos de una categoría específica creados después de cierta fecha
 * responseService.respond("¿Novedades sobre embeddings?", {
 *   metadataFilter: { 
 *     category: "AI",
 *     createdAfter: "2023-01-01"
 *   }
 * });
 * ```
 * 
 * 3. Filtrar por etiquetas (múltiples valores):
 * ```typescript
 * // Buscar en documentos que tengan ambas etiquetas
 * responseService.respond("¿Cómo mejorar embeddings?", {
 *   metadataFilter: { 
 *     tags: { $in: ["vector-database", "optimization"] }
 *   }
 * });
 * ```
 * 
 * 4. Filtrar por origen de los datos:
 * ```typescript
 * // Buscar sólo en documentos de un origen específico
 * responseService.respond("¿Mejores prácticas?", {
 *   metadataFilter: { source: "knowledge-base" }
 * });
 * ```
 * 
 * Nota: Los campos disponibles en metadataFilter dependen de cómo se hayan 
 * estructurado los metadatos en tus embeddings. Los ejemplos anteriores son
 * ilustrativos y deben adaptarse a tu modelo de datos real.
 */
@Injectable()
export class OllamaEmbeddingResponseService implements EmbeddingResponseService {
  private readonly defaultModelName: string;
  private readonly defaultPromptName: string;
  private readonly defaultTemperature: number;
  private readonly defaultLimit: number;
  private readonly ollamaBaseUrl: string;

  constructor(
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly configService?: ConfigService
  ) {
    // Inicialización de valores desde variables de entorno o valores predeterminados
    this.defaultModelName = this.getConfigOrDefault('OLLAMA_LLM_MODEL', 'llama3.1:8b');
    this.defaultPromptName = this.getConfigOrDefault('OLLAMA_PROMPT_NAME', 'rlm/rag-prompt');
    this.defaultTemperature = this.getConfigOrDefault('OLLAMA_DEFAULT_TEMPERATURE', 0.7);
    this.defaultLimit = this.getConfigOrDefault('OLLAMA_DEFAULT_LIMIT', 5);
    this.ollamaBaseUrl = this.getConfigOrDefault('OLLAMA_BASE_URL', 'http://localhost:11434');
  }

  /**
   * Obtiene un valor de configuración del ConfigService o devuelve el valor por defecto
   * @param key Clave de la variable de entorno
   * @param defaultValue Valor por defecto si no existe
   * @returns El valor de la variable de entorno o el valor por defecto
   */
  private getConfigOrDefault<T>(key: string, defaultValue: T): T {
    if (!this.configService) {
      return defaultValue;
    }
    
    const value = this.configService.get<T>(key);
    return value !== undefined ? value : defaultValue;
  }

  async respond(
    query: string,
    options: EmbeddingResponseOptions = {}
  ): Promise<EmbeddingResponse> {
    /**
     * Ejemplos de uso del metadataFilter:
     * 
     * 1. Filtrar por tipo de documento:
     * ```typescript
     * const response = await embeddingResponseService.respond("¿Qué son los embeddings?", {
     *   metadataFilter: { type: "technical-documentation" }
     * });
     * ```
     * 
     * 2. Filtrar por categoría y fecha de creación:
     * ```typescript
     * const response = await embeddingResponseService.respond("¿Cómo implementar RAG?", {
     *   metadataFilter: { 
     *     category: "implementation-guide",
     *     createdAt: { $gt: new Date("2023-01-01") }
     *   }
     * });
     * ```
     * 
     * 3. Filtrar por múltiples etiquetas:
     * ```typescript
     * const response = await embeddingResponseService.respond("Mejores prácticas", {
     *   metadataFilter: { 
     *     tags: { $in: ["vector-databases", "embeddings", "optimization"] }
     *   }
     * });
     * ```
     * 
     * 4. Filtrar por origen del contenido:
     * ```typescript
     * const response = await embeddingResponseService.respond("Ejemplos de uso", {
     *   metadataFilter: { source: "oficial-documentation" }
     * });
     * ```
     * 
     * Nota: Los campos disponibles en metadataFilter dependen de cómo hayas estructurado
     * los metadatos en tus embeddings. Los ejemplos anteriores son ilustrativos y deben
     * adaptarse a tu modelo de datos real.
     */
    
    const {
      limit = this.defaultLimit,
      metadataFilter,
      temperature = this.defaultTemperature,
      systemPrompt
    } = options;

    // 1. Obtener los documentos relacionados con la consulta
    const embeddings = await this.embeddingRepository.search(
      query,
      limit,
      metadataFilter
    );

    // Extraer contenido de los embeddings para usarlo como contexto
    const context = embeddings.map(embedding => ({
      pageContent: embedding.content,
      metadata: { 
        ...embedding.metadata,
        id: embedding.id 
      }
    }));

    // 2. Configurar el modelo y el prompt
    const llm = new ChatOllama({ 
      model: this.defaultModelName, 
      temperature,
      baseUrl: this.ollamaBaseUrl
    });

    // Obtener el prompt predeterminado o personalizado
    let promptTemplate: ChatPromptTemplate;
    if (systemPrompt) {
      promptTemplate = ChatPromptTemplate.fromMessages([
        ["system", systemPrompt],
        ["human", "Pregunta: {question}\n\nContexto: {context}"]
      ]);
    } else {
      // Usar el prompt predeterminado de LangChain Hub
      promptTemplate = await pull<ChatPromptTemplate>(this.defaultPromptName);
    }

    // 3. Crear la cadena RAG
    const ragChain = await createStuffDocumentsChain({
      llm,
      prompt: promptTemplate,
      outputParser: new StringOutputParser(),
    });

    // 4. Ejecutar la cadena para obtener la respuesta
    const startTime = Date.now();
    const responseContent = await ragChain.invoke({
      question: query,
      context
    });
    const endTime = Date.now();

    // 5. Preparar la respuesta
    return {
      content: responseContent,
      metadata: {
        model: this.defaultModelName,
        timestamp: new Date(),
        sourceDocuments: context, // Incluimos los documentos fuente en los metadatos
        processingTimeMs: endTime - startTime
      }
    };
  }
} 