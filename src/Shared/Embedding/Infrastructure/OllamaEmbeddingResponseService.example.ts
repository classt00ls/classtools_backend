import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaEmbeddings } from '@langchain/ollama';
import { OllamaFunctions } from '@langchain/community/llms/ollama_functions';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

import { EmbeddingRepository } from '../../Domain/EmbeddingRepository';
import { EmbeddingResponseService } from '../../Domain/EmbeddingResponseService';

/**
 * Ejemplo de implementación del servicio OllamaEmbeddingResponseService
 * utilizando variables de entorno para la configuración
 */
@Injectable()
export class OllamaEmbeddingResponseService implements EmbeddingResponseService {
  private readonly defaultSystemPrompt: string = 'Eres un asistente útil y conciso.';
  private readonly defaultLimit: number;
  private readonly defaultTemperature: number;
  private readonly model: string;
  
  constructor(
    private readonly embeddingRepository: EmbeddingRepository,
    private readonly configService: ConfigService
  ) {
    // Inicialización de valores desde variables de entorno
    this.defaultLimit = this.configService.get<number>('OLLAMA_DEFAULT_LIMIT') || 5;
    this.defaultTemperature = this.configService.get<number>('OLLAMA_DEFAULT_TEMPERATURE') || 0.7;
    this.model = this.configService.get<string>('OLLAMA_LLM_MODEL') || 'llama3';
  }
  
  async respond(query: string, options: {
    limit?: number,
    metadataFilter?: Record<string, any>,
    temperature?: number,
    systemPrompt?: string
  } = {}): Promise<string> {
    const {
      limit = this.defaultLimit,
      metadataFilter,
      temperature = this.defaultTemperature,
      systemPrompt = this.defaultSystemPrompt
    } = options;
    
    // Buscar documentos relevantes usando el repositorio
    const relevantEmbeddings = await this.embeddingRepository.search(query, limit, metadataFilter);
    
    if (relevantEmbeddings.length === 0) {
      return `No encontré información relacionada con: ${query}`;
    }
    
    // Preparar el contexto para el LLM
    const context = relevantEmbeddings
      .map(embedding => embedding.content)
      .join('\n\n');
    
    // Configurar el LLM usando Ollama
    const llm = new OllamaFunctions({
      model: this.model,
      baseUrl: this.configService.get<string>('OLLAMA_BASE_URL'),
      temperature,
    });
    
    // Crear el prompt para el LLM
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `${systemPrompt}\n\nUtiliza el siguiente contexto para responder a la pregunta del usuario:\n\n${context}`
      ),
      HumanMessagePromptTemplate.fromTemplate('{query}')
    ]);
    
    // Ejecutar la cadena
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    
    // Generar respuesta
    const response = await chain.invoke({
      query
    });
    
    return response;
  }
} 