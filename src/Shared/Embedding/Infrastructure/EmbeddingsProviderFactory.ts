import { Embeddings } from '@langchain/core/embeddings';
import { OllamaEmbeddings } from '@langchain/ollama';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Factory para crear diferentes proveedores de embeddings
 * según la configuración del entorno.
 */
@Injectable()
export class EmbeddingsProviderFactory {
  private static readonly logger = new Logger(EmbeddingsProviderFactory.name);

  /**
   * Crea una instancia del proveedor de embeddings según la configuración
   * 
   * @param configService Servicio de configuración de NestJS
   * @returns Instancia de Embeddings configurada
   */
  static create(configService: ConfigService): Embeddings {
    // Implementar estrategia híbrida basada en el entorno
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    // Si hay un proveedor específico configurado, ese tiene prioridad
    const configuredProvider = configService.get<string>('EMBEDDINGS_PROVIDER', null);
    
    // Determinar el proveedor basado en la estrategia híbrida o configuración explícita
    let provider: string;
    
    if (configuredProvider) {
      // Si hay un proveedor configurado explícitamente, usamos ese
      provider = configuredProvider;
      EmbeddingsProviderFactory.logger.log(`Usando proveedor configurado: ${provider}`);
    } else {
      // Estrategia híbrida: OpenAI para producción, Ollama para desarrollo/otros
      if (nodeEnv === 'production') {
        provider = 'openai';
        EmbeddingsProviderFactory.logger.log('Entorno de producción detectado: usando OpenAI para embeddings');
      } else {
        provider = 'ollama';
        EmbeddingsProviderFactory.logger.log(`Entorno de desarrollo (${nodeEnv}) detectado: usando Ollama para embeddings`);
      }
    }
    
    // Crear el proveedor basado en la selección
    switch (provider.toLowerCase()) {
      case 'openai':
        const openaiKey = configService.get<string>('OPENAI_API_KEY', '');
        if (!openaiKey) {
          EmbeddingsProviderFactory.logger.warn('OPENAI_API_KEY no configurada, usando Ollama como fallback');
          return EmbeddingsProviderFactory.createOllamaEmbeddings(configService);
        }
        
        return new OpenAIEmbeddings({
          openAIApiKey: openaiKey,
          modelName: configService.get<string>('OPENAI_EMBEDDINGS_MODEL', 'text-embedding-ada-002'),
        });
        
      case 'ollama':
      default:
        return EmbeddingsProviderFactory.createOllamaEmbeddings(configService);
    }
  }
  
  /**
   * Crea un proveedor de embeddings Ollama
   */
  private static createOllamaEmbeddings(configService: ConfigService): OllamaEmbeddings {
    EmbeddingsProviderFactory.logger.log('Creando proveedor Ollama para embeddings');
    return new OllamaEmbeddings({
      model: configService.get<string>('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text'),
      baseUrl: configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434'),
    });
  }
  
  /**
   * Devuelve la lista de proveedores disponibles
   * @returns Array con los nombres de los proveedores soportados
   */
  static getAvailableProviders(): string[] {
    return ['ollama', 'openai', 'auto'];
  }
} 