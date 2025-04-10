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
  }

  async save(): Promise<void> {
    // Mock
  }
  
  async saveMany(): Promise<void> {
    // Mock
  }
  
  async findById(): Promise<Embedding | null> {
    return null;
  }
  
  async search(): Promise<Embedding[]> {
    return [];
  }
  
  async searchSimilar(): Promise<Embedding[]> {
    return [];
  }
  
  async delete(): Promise<void> {
    // Mock
  }
  
  async deleteMany(): Promise<void> {
    // Mock
  }
} 