import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { OllamaEmbeddings } from '@langchain/ollama';
import { DistanceStrategy, PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';

import { Embedding, EmbeddingPrimitives } from '../Domain/Embedding';
import { EmbeddingRepository } from '../Domain/EmbeddingRepository';

@Injectable()
export class PGVectorEmbeddingRepository implements EmbeddingRepository {
  private vectorStore: PGVectorStore;
  private embeddingsGenerator: OllamaEmbeddings;
  
  constructor() {
    this.embeddingsGenerator = new OllamaEmbeddings({
      model: 'nomic-embed-text',
      baseUrl: 'http://localhost:11434',
    });
    
    this.initializeVectorStore();
  }
  
  private async initializeVectorStore(): Promise<void> {
    this.vectorStore = await PGVectorStore.initialize(
      this.embeddingsGenerator,
      {
        postgresConnectionOptions: {
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: 'postgres',
          database: 'postgres',
        } as PoolConfig,
        tableName: 'embeddings',
        columns: {
          idColumnName: 'id',
          contentColumnName: 'content',
          metadataColumnName: 'metadata',
          vectorColumnName: 'embedding',
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
    return new Document({
      pageContent: embedding.content,
      metadata: {
        ...embedding.metadata,
        // Añadimos campos adicionales en metadata para poder reconstruir el objeto completo
        _createdAt: embedding.createdAt.toISOString(),
        _updatedAt: embedding.updatedAt.toISOString(),
        _id: embedding.id // Redundante pero útil para reconstrucción
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