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
    console.log('🔄 PGVectorEmbeddingRepository: Constructor iniciado');
    
    // Configuración del generador de embeddings
    const ollamaBaseUrl = this.getConfigOrDefault('OLLAMA_BASE_URL', 'http://localhost:11434');
    const embedModel = this.getConfigOrDefault('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text');
    
    this.embeddingsGenerator = new OllamaEmbeddings({
      model: embedModel,
      baseUrl: ollamaBaseUrl,
    });
    
    // No inicializar el vectorStore en el constructor, ya que puede fallar.
    // Se hará bajo demanda (lazy initialization) cuando se necesite.
    console.log('🔄 PGVectorEmbeddingRepository: Constructor completado - Vector Store se inicializará bajo demanda');
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
    try {
      console.log('🔄 PGVectorEmbeddingRepository: Inicializando Vector Store...');
      
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
    
      console.log('📦 DB CONNECTION CONFIG (PGVectorEmbeddingRepository):', {
        host: dbHost,
        port: dbPort,
        user: dbUser,
        database: dbName,
        ssl: useSSL,
        tableName,
        idColumnName,
        contentColumnName,
        metadataColumnName,
        vectorColumnName
      });
    
      console.log('⏳ Inicializando conexión a PGVectorStore...');
      
      try {
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
        console.log('✅ Vector Store initialized successfully');
      } catch (connectionError) {
        console.error('❌ ERROR en conexión a PGVectorStore:', connectionError);
        throw new Error(`Error conectando a PGVectorStore: ${connectionError.message}`);
      }
    } catch (error) {
      console.error('❌ ERROR en initializeVectorStore:', error);
      throw new Error(`Error inicializando Vector Store: ${error.message}`);
    }
  }

  /**
   * Obtiene el Vector Store, inicializándolo si es necesario
   * @returns El Vector Store inicializado
   * @throws Error si hay problemas inicializando el Vector Store
   */
  private async getVectorStore(): Promise<PGVectorStore> {
    if (!this.vectorStore) {
      console.log('🔄 Inicializando Vector Store bajo demanda');
      await this.initializeVectorStore();
    }
    return this.vectorStore;
  }

  async save(embedding: Embedding): Promise<void> {
    try {
      const vectorStore = await this.getVectorStore();
      const document = this.toDocument(embedding);
      
      // Enfoque intermedio: Más control sobre IDs
      const embeddings = await this.embeddingsGenerator.embedDocuments([document.pageContent]);
      
      await vectorStore.addVectors(
        embeddings,
        [document],
        { ids: [embedding.id] }
      );
    } catch (error) {
      console.error('❌ Error en save:', error);
      throw new Error(`Error guardando embedding: ${error.message}`);
    }
  }
  
  async saveMany(embeddings: Embedding[]): Promise<void> {
    try {
      const vectorStore = await this.getVectorStore();
      const documents = embeddings.map(embedding => this.toDocument(embedding));
      const contents = documents.map(doc => doc.pageContent);
      
      // Enfoque intermedio en batch
      const vectorEmbeddings = await this.embeddingsGenerator.embedDocuments(contents);
      
      await vectorStore.addVectors(
        vectorEmbeddings,
        documents,
        { ids: embeddings.map(e => e.id) }
      );
    } catch (error) {
      console.error('❌ Error en saveMany:', error);
      throw new Error(`Error guardando múltiples embeddings: ${error.message}`);
    }
  }
  
  async findById(id: string): Promise<Embedding | null> {
    try {
      const vectorStore = await this.getVectorStore();
      
      // Usamos SQL directo para búsqueda por ID exacto
      const result = await vectorStore.client.sql`
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
      const vectorStore = await this.getVectorStore();
      
      // Enfoque de alto nivel: Usamos API de LangChain para búsqueda semántica
      const results = await vectorStore.similaritySearch(
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
      
      const vectorStore = await this.getVectorStore();
      
      // Enfoque manual: SQL directo para mejor rendimiento en casos críticos
      const embedding = JSON.stringify(
        await this.embeddingsGenerator.embedQuery(original.content)
      );
      
      const results = await vectorStore.client.sql`
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
      const vectorStore = await this.getVectorStore();
      
      await vectorStore.client.sql`
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
      const vectorStore = await this.getVectorStore();
      
      await vectorStore.client.sql`
        DELETE FROM embeddings
        WHERE id = ANY(${ids}::text[]);
      `;
    } catch (error) {
      console.error('❌ Error en deleteMany:', error);
      throw new Error(`Error eliminando múltiples embeddings: ${error.message}`);
    }
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