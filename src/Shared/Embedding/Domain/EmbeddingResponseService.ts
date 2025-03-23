/**
 * Estructura de los metadatos de respuesta de embedding
 */
export interface EmbeddingResponseMetadata {
  /** Modelo LLM utilizado para generar la respuesta */
  model?: string;
  
  /** Timestamp de cuando se generó la respuesta */
  timestamp?: Date;
  
  /** Documentos fuente utilizados para generar la respuesta */
  sourceDocuments?: any[];
  
  /** Tiempo de procesamiento en milisegundos */
  processingTimeMs?: number;
  
  /** Query utilizada para búsqueda de embeddings */
  searchQuery?: string;
  
  /** Query utilizada para la generación del LLM */
  llmQuery?: string;
  
  /** Permite campos adicionales */
  [key: string]: any;
}

/**
 * Estructura de respuesta para consultas de embedding
 */
export interface EmbeddingResponse {
  content: string;
  metadata: EmbeddingResponseMetadata;
}

import { EmbeddingResponseOptions } from './EmbeddingResponseOptions';

/**
 * Servicio para generar respuestas basadas en embeddings
 */
export interface EmbeddingResponseService {
  /**
   * Genera una respuesta para una consulta utilizando embeddings
   * 
   * @param query - La consulta en lenguaje natural
   * @param options - Opciones para personalizar la respuesta
   * @returns Una respuesta generada basada en los embeddings relevantes
   */
  respond(query: string, options?: EmbeddingResponseOptions): Promise<EmbeddingResponse>;
} 