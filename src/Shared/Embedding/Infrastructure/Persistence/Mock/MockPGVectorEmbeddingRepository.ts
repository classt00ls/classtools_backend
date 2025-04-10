import { Injectable } from '@nestjs/common';
import { Embedding } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';

/**
 * Implementación mock del repositorio de embeddings
 * Sirve como alternativa cuando no se puede o no se quiere usar la implementación real
 */
@Injectable()
export class MockPGVectorEmbeddingRepository implements EmbeddingRepository {
  private vectorStore: any;
  private embeddingsGenerator: any;
  
  constructor() {
    console.log('🚨 MOCK: Inicializando MockPGVectorEmbeddingRepository');
    console.log('🚨 MOCK: Variables de entorno relevantes:');
    console.log('🚨 MOCK: USE_MOCK_EMBEDDINGS =', process.env.USE_MOCK_EMBEDDINGS);
    console.log('🚨 MOCK: PGVECTOR_HOST =', process.env.PGVECTOR_HOST);
    console.log('🚨 MOCK: PGVECTOR_PORT =', process.env.PGVECTOR_PORT);
    
    // Crear objetos mock en lugar de conexiones reales
    this.vectorStore = {
      client: {
        sql: async () => [],
        end: async () => {},
      },
      addVectors: async () => {},
      similaritySearch: async () => [],
      asRetriever: () => ({ invoke: async () => [] }),
      end: async () => {},
    };
    
    this.embeddingsGenerator = {
      embedDocuments: async () => [new Array(1536).fill(0)],
      embedQuery: async () => new Array(1536).fill(0),
    };
    
    console.log('🚨 MOCK: MockPGVectorEmbeddingRepository inicializado con éxito');
  }

  async save(): Promise<void> {
    console.log('📝 MOCK: Operación save ignorada');
  }
  
  async saveMany(): Promise<void> {
    console.log('📝 MOCK: Operación saveMany ignorada');
  }
  
  async findById(): Promise<Embedding | null> {
    console.log('📝 MOCK: Operación findById ignorada');
    return null;
  }
  
  async search(): Promise<Embedding[]> {
    console.log('📝 MOCK: Operación search ignorada');
    return [];
  }
  
  async searchSimilar(): Promise<Embedding[]> {
    console.log('📝 MOCK: Operación searchSimilar ignorada');
    return [];
  }
  
  async delete(): Promise<void> {
    console.log('📝 MOCK: Operación delete ignorada');
  }
  
  async deleteMany(): Promise<void> {
    console.log('📝 MOCK: Operación deleteMany ignorada');
  }
} 