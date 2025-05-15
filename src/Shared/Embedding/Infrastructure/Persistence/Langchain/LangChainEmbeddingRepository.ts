import { Injectable, Inject } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';

import { Embedding, EmbeddingPrimitives } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';

@Injectable()
export class LangChainEmbeddingRepository implements EmbeddingRepository {
  constructor(
    @Inject('PGVectorStore') private readonly vectorStore: PGVectorStore,
    private readonly embeddingsGenerator: Embeddings
  ) {}

  async save(embedding: Embedding): Promise<void> { 
    try {
      console.log(`⏳ Guardando embedding con ID: ${embedding.id}`);
      
      const existingEmbedding = await this.findById(embedding.id);
      if (existingEmbedding) {
        console.log(`⚠️ El embedding con ID ${embedding.id} ya existe.`);
        return;
      }

      const document = this.toDocument(embedding);
      const embeddings = await this.embeddingsGenerator.embedDocuments([document.pageContent]);
      
      await this.vectorStore.addVectors(
        embeddings,
        [document],
        { ids: [embedding.id] }
      );
      
      console.log(`✅ Embedding guardado exitosamente con ID: ${embedding.id}`);
    } catch (error) {
      console.error(`❌ Error guardando embedding ${embedding.id}:`, error);
    }
  }
  
  async saveMany(embeddings: Embedding[]): Promise<void> {
    console.log(`⏳ Guardando ${embeddings.length} embeddings`);
    
    const idsToCheck = embeddings.map(e => e.id);
    const existingIds = new Set<string>();
    
    try {
      const result = await this.vectorStore.client.sql`
        SELECT id FROM embeddings 
        WHERE id = ANY(${idsToCheck}::text[]);
      `;
      
      result.forEach(row => existingIds.add(row.id));
      
      if (existingIds.size > 0) {
        console.log(`⚠️ ${existingIds.size} embeddings ya existen y serán omitidos`);
      }
      
      const newEmbeddings = embeddings.filter(e => !existingIds.has(e.id));
      
      if (newEmbeddings.length === 0) {
        console.log('✅ No hay nuevos embeddings para guardar');
        return;
      }
      
      const documents = newEmbeddings.map(embedding => this.toDocument(embedding));
      const contents = documents.map(doc => doc.pageContent);
      const vectorEmbeddings = await this.embeddingsGenerator.embedDocuments(contents);
      
      try {
        await this.vectorStore.addVectors(
          vectorEmbeddings,
          documents,
          { ids: newEmbeddings.map(e => e.id) }
        );
        console.log(`✅ ${newEmbeddings.length} embeddings guardados correctamente`);
      } catch (insertError) {
        console.error('⚠️ Error al insertar embeddings:', insertError.message);
        console.log('⚠️ Continuando con el siguiente lote...');
        
        for (const embedding of newEmbeddings) {
          try {
            await this.save(embedding);
          } catch (individualError) {
            console.error(`⚠️ No se pudo guardar embedding ${embedding.id}: ${individualError.message}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error en saveMany:', error);
    }
  }
  
  async findById(id: string): Promise<Embedding | null> {
    try {
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
      console.error('❌ Error finding embedding by ID:', error);
      return null;
    }
  }
  
  async search(query: string, limit: number = 5, metadataFilter?: Record<string, any>): Promise<Embedding[]> {
    try {
      const results = await this.vectorStore.similaritySearch(
        query,
        limit,
        metadataFilter
      );
      
      return results.map(doc => this.documentToDomain(doc));
    } catch (error) {
      console.error('❌ Error en search:', error);
      return [];
    }
  }
  
  async searchSimilar(id: string, limit: number = 5): Promise<Embedding[]> {
    try {
      const original = await this.findById(id);
      
      if (!original) {
        return [];
      }
      
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
      console.error('❌ Error searching similar embeddings:', error);
      return [];
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      await this.vectorStore.client.sql`
        DELETE FROM embeddings
        WHERE id = ${id};
      `;
    } catch (error) {
      console.error('❌ Error en delete:', error);
      throw new Error(`Error eliminando embedding: ${error.message}`);
    }
  }
  
  async deleteMany(ids: string[]): Promise<void> {
    try {
      await this.vectorStore.client.sql`
        DELETE FROM embeddings
        WHERE id = ANY(${ids}::text[]);
      `;
    } catch (error) {
      console.error('❌ Error en deleteMany:', error);
      throw new Error(`Error eliminando múltiples embeddings: ${error.message}`);
    }
  }
  
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