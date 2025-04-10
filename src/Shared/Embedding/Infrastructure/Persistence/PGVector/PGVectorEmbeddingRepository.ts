import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/ollama';
import { DistanceStrategy, PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';

import { Embedding, EmbeddingPrimitives } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';

@Injectable()
export class PGVectorEmbeddingRepository implements EmbeddingRepository {
  private vectorStore: PGVectorStore;
  private embeddingsGenerator: OllamaEmbeddings;
  
  constructor(private readonly configService?: ConfigService) {
    // Configuración del generador de embeddings
    const ollamaBaseUrl = this.getConfigOrDefault('OLLAMA_BASE_URL', 'http://localhost:11434');
    const embedModel = this.getConfigOrDefault('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text');
    
    this.embeddingsGenerator = new OllamaEmbeddings({
      model: embedModel,
      baseUrl: ollamaBaseUrl,
    });
    
    this.initializeVectorStore();
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
  
  private async initializeVectorStore(): Promise<void> {
    const dbHost = this.getConfigOrDefault('PGVECTOR_HOST', 'localhost');
    const dbPort = parseInt(this.getConfigOrDefault('PGVECTOR_PORT', '5432'));
    const dbUser = this.getConfigOrDefault('PGVECTOR_USER', 'postgres');
    const dbPassword = this.getConfigOrDefault('PGVECTOR_PASSWORD', 'postgres');
    const dbName = this.getConfigOrDefault('PGVECTOR_DB', 'postgres');
    const useSSL = this.getConfigOrDefault<string>('PGVECTOR_SSL', 'false') === 'true';
  
    const tableName = this.getConfigOrDefault('PGVECTOR_TABLE', 'embeddings');
    const idColumnName = this.getConfigOrDefault('PGVECTOR_COL_ID', 'id');
    const contentColumnName = this.getConfigOrDefault('PGVECTOR_COL_CONTENT', 'content');
    const metadataColumnName = this.getConfigOrDefault('PGVECTOR_COL_METADATA', 'metadata');
    const vectorColumnName = this.getConfigOrDefault('PGVECTOR_COL_VECTOR', 'embedding');
  
    console.log('📦 DB CONNECTION CONFIG:', {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      ssl: useSSL,
    });
  
    this.vectorStore = await PGVectorStore.initialize(
      this.embeddingsGenerator,
      {
        postgresConnectionOptions: {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        } as PoolConfig,
        tableName: tableName,
        columns: {
          idColumnName: idColumnName,
          contentColumnName: contentColumnName,
          metadataColumnName: metadataColumnName,
          vectorColumnName: vectorColumnName,
        },
        distanceStrategy: 'cosine' as DistanceStrategy,
      }
    );

    console.log('📦 Vector Store initialized successfully');
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
  
  async saveMany(embeddings: Embedding[]): Promise<void> {
    const documents = embeddings.map(embedding => this.toDocument(embedding));
    const contents = documents.map(doc => doc.pageContent);
    
    // Enfoque intermedio en batch
    const vectorEmbeddings = await this.embeddingsGenerator.embedDocuments(contents);
    
    await this.vectorStore.addVectors(
      vectorEmbeddings,
      documents,
      { ids: embeddings.map(e => e.id) }
    );
  }
  
  async findById(id: string): Promise<Embedding | null> {
    try {
      // Usamos SQL directo para búsqueda por ID exacto
      const result = await this.vectorStore.client.sql`
        SELECT id, content, metadata, created_at, updated_at
        FROM embeddings
        WHERE id = ${id}
        LIMIT 1;
      `;
      
      if (result.length === 0) {
        return null;
      }
      
      return this.toDomain(result[0]);
    } catch (error) {
      console.error('Error finding embedding by ID:', error);
      return null;
    }
  }
  
  async search(query: string, limit: number = 5, metadataFilter?: Record<string, any>): Promise<Embedding[]> {
    // Enfoque de alto nivel: Usamos API de LangChain para búsqueda semántica
    const results = await this.vectorStore.similaritySearch(
      query,
      limit,
      metadataFilter
    );
    
    return results.map(doc => this.documentToDomain(doc));
  }
  
  async searchSimilar(id: string, limit: number = 5): Promise<Embedding[]> {
    try {
      const original = await this.findById(id);
      
      if (!original) {
        return [];
      }
      
      // Enfoque manual: SQL directo para mejor rendimiento en casos críticos
      const embedding = JSON.stringify(
        await this.embeddingsGenerator.embedQuery(original.content)
      );
      
      const results = await this.vectorStore.client.sql`
        SELECT id, content, metadata, created_at, updated_at
        FROM embeddings
        WHERE id != ${id}
        ORDER BY (embedding <=> ${embedding})
        LIMIT ${limit};
      `;
      
      return results.map(row => this.toDomain(row));
    } catch (error) {
      console.error('Error searching similar embeddings:', error);
      return [];
    }
  }
  
  async delete(id: string): Promise<void> {
    await this.vectorStore.client.sql`
      DELETE FROM embeddings
      WHERE id = ${id};
    `;
  }
  
  async deleteMany(ids: string[]): Promise<void> {
    await this.vectorStore.client.sql`
      DELETE FROM embeddings
      WHERE id = ANY(${ids}::text[]);
    `;
  }
  
  private toDocument(embedding: Embedding): Document {
    // Ahora podemos acceder directamente a las propiedades
    return new Document({
      pageContent: embedding.content,
      metadata: {
        ...embedding.metadata,
        // Añadimos campos adicionales en metadata para poder reconstruir el objeto completo
        _createdAt: embedding.createdAt.toISOString(),
        _updatedAt: embedding.updatedAt.toISOString(),
        _id: embedding.id
      }
    });
  }
  
  private documentToDomain(document: Document): Embedding {
    const { _id, _createdAt, _updatedAt, ...restMetadata } = document.metadata;
    
    const primitives: EmbeddingPrimitives = {
      id: _id as string,
      content: document.pageContent,
      metadata: restMetadata,
      createdAt: new Date(_createdAt as string),
      updatedAt: new Date(_updatedAt as string)
    };
    
    return Embedding.fromPrimitives(primitives);
  }
  
  private toDomain(row: any): Embedding {
    const primitives: EmbeddingPrimitives = {
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
    
    return Embedding.fromPrimitives(primitives);
  }
} 