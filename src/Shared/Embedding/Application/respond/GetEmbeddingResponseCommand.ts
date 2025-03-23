import { EmbeddingResponseOptions } from '../../Domain/EmbeddingResponseOptions';

/**
 * Comando para obtener una respuesta de embeddings
 * 
 * @param searchQuery Query para buscar documentos relevantes
 * @param options Opciones que pueden incluir llmQuery para la generación de respuesta
 */
export class GetEmbeddingResponseCommand {
  constructor(
    public readonly searchQuery: string,
    public readonly options?: EmbeddingResponseOptions
  ) {}
} 