import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/ollama';
import { DistanceStrategy, PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';

import { Embedding, EmbeddingPrimitives } from '../../../Domain/Embedding';
import { EmbeddingRepository } from '../../../Domain/EmbeddingRepository';

/**
 * Ejemplo de implementación del repositorio PGVectorEmbeddingRepository
 * utilizando variables de entorno para la configuración
 */
@Injectable()
export class PGVectorEmbeddingRepository implements EmbeddingRepository {
  private vectorStore: PGVectorStore;
  private embeddingsGenerator: OllamaEmbeddings;
  
  constructor(private configService: ConfigService) {
    // Inicialización del generador de embeddings usando variables de entorno
    this.embeddingsGenerator = new OllamaEmbeddings({
      model: this.configService.get<string>('OLLAMA_EMBEDDINGS_MODEL'),
      baseUrl: this.configService.get<string>('OLLAMA_BASE_URL'),
    });
    
    this.initializeVectorStore();
  }
  
  private async initializeVectorStore(): Promise<void> {
    this.vectorStore = await PGVectorStore.initialize(
      this.embeddingsGenerator,
      {
        postgresConnectionOptions: {
          type: 'postgres',
          host: this.configService.get<string>('PGVECTOR_HOST'),
          port: this.configService.get<number>('PGVECTOR_PORT'),
          user: this.configService.get<string>('PGVECTOR_USER'),
          password: this.configService.get<string>('PGVECTOR_PASSWORD'),
          database: this.configService.get<string>('PGVECTOR_DB'),
          ssl: this.configService.get<boolean>('PGVECTOR_SSL'),
        } as PoolConfig,
        tableName: this.configService.get<string>('PGVECTOR_TABLE'),
        columns: {
          idColumnName: this.configService.get<string>('PGVECTOR_COL_ID'),
          contentColumnName: this.configService.get<string>('PGVECTOR_COL_CONTENT'),
          metadataColumnName: this.configService.get<string>('PGVECTOR_COL_METADATA'),
          vectorColumnName: this.configService.get<string>('PGVECTOR_COL_VECTOR'),
        },
        distanceStrategy: 'cosine' as DistanceStrategy,
      }
    );
  }

  async save(embedding: Embedding): Promise<void> {
    const document = this.toDocument(embedding);
    
    // Enfoque intermedio: Más control sobre IDs
    const embeddings = await this.embeddingsGenerator.embedDocuments([document.pageContent]);
    
    await this.vectorStore.addVectors(
      embeddings,
      [document],
      { ids: [embedding.id] }
    );
  }
  
  // El resto de la implementación sigue igual...
  
  private toDocument(embedding: Embedding): Document {
    return new Document({
      pageContent: embedding.content,
      metadata: {
        ...embedding.metadata,
        _createdAt: embedding.createdAt.toISOString(),
        _updatedAt: embedding.updatedAt.toISOString(),
        _id: embedding.id
      }
    });
  }
  
  // Otros métodos omitidos para brevedad...
} 