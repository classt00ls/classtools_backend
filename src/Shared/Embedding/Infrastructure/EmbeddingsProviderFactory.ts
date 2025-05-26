import { Embeddings } from '@langchain/core/embeddings';
import { OllamaEmbeddings } from '@langchain/ollama';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Factory para crear diferentes proveedores de embeddings
 * según la configuración del entorno.
 * 
 * Los embeddings son representaciones vectoriales de texto que capturan su significado semántico.
 * Esta factory permite cambiar entre diferentes proveedores de embeddings (OpenAI, Ollama)
 * según el entorno o configuración específica.
 */
@Injectable()
export class EmbeddingsProviderFactory {
  // Logger para registrar información sobre qué proveedor se está usando
  private static readonly logger = new Logger(EmbeddingsProviderFactory.name);

  /**
   * Crea una instancia del proveedor de embeddings según la configuración
   * 
   * Estrategia de selección del proveedor:
   * 1. Si hay un proveedor explícitamente configurado en EMBEDDINGS_PROVIDER, se usa ese
   * 2. Si no, se usa una estrategia basada en el entorno:
   *    - En producción: OpenAI (mejor calidad, pero de pago)
   *    - En desarrollo: Ollama (gratuito, local)
   * 
   * @param configService Servicio de configuración de NestJS que proporciona acceso a las variables de entorno
   * @returns Instancia de Embeddings configurada y lista para usar
   */
  static create(configService: ConfigService): Embeddings {
    // Obtener el entorno actual (development, production, etc.)
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    // Verificar si hay un proveedor específico configurado
    const configuredProvider = configService.get<string>('EMBEDDINGS_PROVIDER', null);
    
    let provider: string;
    
    if (configuredProvider) {
      // Prioridad 1: Usar el proveedor explícitamente configurado
      provider = configuredProvider;
      EmbeddingsProviderFactory.logger.log(`Usando proveedor configurado: ${provider}`);
    } else {
      // Prioridad 2: Estrategia basada en entorno
      if (nodeEnv === 'production') {
        // En producción usamos OpenAI por su mejor calidad y estabilidad
        provider = 'openai';
        EmbeddingsProviderFactory.logger.log('Entorno de producción detectado: usando OpenAI para embeddings');
      } else {
        // En desarrollo usamos Ollama por ser gratuito y local
        provider = 'ollama';
        EmbeddingsProviderFactory.logger.log(`Entorno de desarrollo (${nodeEnv}) detectado: usando Ollama para embeddings`);
      }
    }
    
    // Crear la instancia del proveedor seleccionado
    switch (provider.toLowerCase()) {
      case 'openai':
        // Verificar que tenemos la API key de OpenAI
        const openaiKey = configService.get<string>('OPENAI_API_KEY', '');
        if (!openaiKey) {
          // Si no hay API key, fallback a Ollama
          EmbeddingsProviderFactory.logger.warn('OPENAI_API_KEY no configurada, usando Ollama como fallback');
          return EmbeddingsProviderFactory.createOllamaEmbeddings(configService);
        }
        
        // Crear instancia de OpenAI con la configuración especificada
        return new OpenAIEmbeddings({
          openAIApiKey: openaiKey,
          modelName: configService.get<string>('OPENAI_EMBEDDINGS_MODEL', 'text-embedding-ada-002'),
        });
        
      case 'ollama':
      default:
        // Ollama como proveedor por defecto o cuando se especifica explícitamente
        return EmbeddingsProviderFactory.createOllamaEmbeddings(configService);
    }
  }
  
  /**
   * Crea un proveedor de embeddings Ollama
   * 
   * Ollama es un servicio local que permite ejecutar modelos de IA en tu propia máquina.
   * Es gratuito y no requiere API key, pero la calidad puede ser menor que OpenAI.
   * 
   * @param configService Servicio de configuración para obtener los parámetros de Ollama
   * @returns Instancia de OllamaEmbeddings configurada
   */
  private static createOllamaEmbeddings(configService: ConfigService): OllamaEmbeddings {
    EmbeddingsProviderFactory.logger.log('Creando proveedor Ollama para embeddings');
    return new OllamaEmbeddings({
      // Modelo por defecto: nomic-embed-text, que es bueno para embeddings
      model: configService.get<string>('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text'),
      // URL por defecto: localghost:11434, que es donde Ollama corre por defecto
      baseUrl: configService.get<string>('OLLAMA_BASE_URL', 'http://localghost:11434'),
    });
  }
  
  /**
   * Devuelve la lista de proveedores disponibles
   * 
   * Esta lista se puede usar para validar la configuración o mostrar opciones disponibles
   * en la interfaz de usuario o documentación.
   * 
   * @returns Array con los nombres de los proveedores soportados
   */
  static getAvailableProviders(): string[] {
    return ['ollama', 'openai', 'auto'];
  }
} 