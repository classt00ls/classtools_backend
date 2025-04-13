import { Injectable } from '@nestjs/common';
import { Document } from '@langchain/core/documents';
import { Embeddings } from '@langchain/core/embeddings';
import { DistanceStrategy, PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { PoolConfig } from 'pg';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { Embedding, EmbeddingPrimitives } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';
import { EmbeddingsProviderFactory } from '../../EmbeddingsProviderFactory';

@Injectable()
export class PGVectorEmbeddingRepository implements EmbeddingRepository {
  private vectorStore: PGVectorStore;
  private embeddingsGenerator: Embeddings;
  
  constructor(
    private readonly configService?: ConfigService,
    private readonly existingDataSource?: DataSource
  ) {
    console.log('🔄 PGVectorEmbeddingRepository: Constructor iniciado');
    console.log('🔍 PGVectorEmbeddingRepository: existingDataSource existe:', !!this.existingDataSource);
    
    if (this.existingDataSource) {
      console.log('🔍 PGVectorEmbeddingRepository: Tipo de existingDataSource:', typeof this.existingDataSource);
      
      // Examinar la configuración de conexión
      const dbConfig = this.existingDataSource.options as any;
      console.log('🔍 PGVectorEmbeddingRepository: Opciones de conexión:', {
        hasOptions: !!dbConfig,
        hasUrl: !!dbConfig?.url,
        urlType: dbConfig?.url ? typeof dbConfig.url : 'undefined',
        hasHost: !!dbConfig?.host,
        hasUsername: !!dbConfig?.username,
        hasPassword: !!dbConfig?.password,
        passwordType: dbConfig?.password ? typeof dbConfig.password : 'undefined'
      });
    }
    
    // Usar el factory para crear el proveedor de embeddings según la configuración
    this.embeddingsGenerator = EmbeddingsProviderFactory.create(this.configService);
    
    // Si se proporciona una fuente de datos existente, úsala
    if (this.existingDataSource) {
      this.initializeFromExistingConnection();
    } else {
      // No inicializar el vectorStore en el constructor, ya que puede fallar.
      // Se hará bajo demanda (lazy initialization) cuando se necesite.
      console.log('🔄 PGVectorEmbeddingRepository: Constructor completado - Vector Store se inicializará bajo demanda');
    }
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
  
  /**
   * Inicializa el Vector Store usando una conexión existente
   * Esto permite reutilizar la conexión principal de la aplicación
   */
  private async initializeFromExistingConnection() {
    try {
      console.log('🔄 Inicializando PGVectorStore desde conexión existente');
      
      // Obtener configuración para la tabla y columnas
      const tableName = this.getConfigOrDefault('PGVECTOR_TABLE', 'embeddings');
      const idColumnName = this.getConfigOrDefault('PGVECTOR_COL_ID', 'id');
      const contentColumnName = this.getConfigOrDefault('PGVECTOR_COL_CONTENT', 'content');
      const metadataColumnName = this.getConfigOrDefault('PGVECTOR_COL_METADATA', 'metadata');
      const vectorColumnName = this.getConfigOrDefault('PGVECTOR_COL_VECTOR', 'embedding');
      
      // Crear el PGVectorStore usando la conexión principal
      const dbConfig = this.existingDataSource.options as any;
      
      console.log('🔄 Preparando conexión para PGVector');
      
      // Extraer los detalles de conexión del DataSource
      let connectionOptions: any;
      
      if (dbConfig.url) {
        // Tenemos una URL, dividirla manualmente para evitar problemas de parseo automático
        const url = dbConfig.url as string;
        console.log('🔍 URL detectada:', url.replace(/:[^:]*@/, ':****@'));
        
        try {
          // Supabase URLs tienen formato postgresql://user:password@host:port/database
          const urlParts = url.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
          
          if (!urlParts) {
            throw new Error('Formato de URL no reconocido');
          }
          
          const [_, username, password, host, port, database] = urlParts;
          
          console.log('🔍 Detalles extraídos de URL:', {
            username,
            password: '****', // No mostrar contraseña
            host,
            port,
            database
          });
          
          // Crear configuración de conexión directa
          connectionOptions = {
            user: username,
            password: password,
            host: host,
            port: parseInt(port),
            database: database,
            ssl: dbConfig.ssl || false,
          };
          
          console.log('✅ Opciones de conexión construidas manualmente desde URL');
        } catch (parseError) {
          console.error('❌ Error al analizar URL:', parseError);
          throw parseError;
        }
      } else if (dbConfig.host && dbConfig.username) {
        // Usar configuración con host/username/password
        connectionOptions = {
          user: dbConfig.username,
          password: dbConfig.password,
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          ssl: dbConfig.ssl || false,
        };
        console.log('✅ Opciones de conexión desde host/username/password');
      } else {
        throw new Error('No se encontró configuración de conexión válida');
      }
      
      // Comprobar que la contraseña es un string
      if (typeof connectionOptions.password !== 'string') {
        console.error('⚠️ ERROR CRÍTICO: La contraseña no es un string:', typeof connectionOptions.password);
        throw new Error('La contraseña debe ser un string');
      }
      
      console.log('🔍 Opciones de conexión finales (tipos):', {
        user: typeof connectionOptions.user,
        password: typeof connectionOptions.password,
        host: typeof connectionOptions.host,
        port: typeof connectionOptions.port,
        database: typeof connectionOptions.database,
        ssl: typeof connectionOptions.ssl
      });
      
      this.vectorStore = await PGVectorStore.initialize(
        this.embeddingsGenerator,
        {
          postgresConnectionOptions: {
            type: 'postgres',
            ...connectionOptions
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
      
      console.log('✅ PGVectorStore inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PGVectorStore desde conexión existente:', error);
      console.error('❌ Mensaje de error:', error.message);
      console.error('❌ Stack:', error.stack);
      throw error;
    }
  }

  /**
   * Inicializa el Vector Store usando la configuración del entorno
   * @returns Promise<void>
   * @throws Error si hay problemas inicializando el Vector Store
   */
  private async initializeVectorStore(): Promise<void> {
    try {
      console.log('🔄 PGVectorEmbeddingRepository: Inicializando Vector Store...');
      
      // Usar directamente la URL de conexión desde variables de entorno
      const connectionUrl = this.getConfigOrDefault<string>('DATABASE_URL', '');
      if (!connectionUrl) {
        throw new Error('DATABASE_URL no configurada o vacía');
      }
      
      const tableName = this.getConfigOrDefault('PGVECTOR_TABLE', 'embeddings');
      const idColumnName = this.getConfigOrDefault('PGVECTOR_COL_ID', 'id');
      const contentColumnName = this.getConfigOrDefault('PGVECTOR_COL_CONTENT', 'content');
      const metadataColumnName = this.getConfigOrDefault('PGVECTOR_COL_METADATA', 'metadata');
      const vectorColumnName = this.getConfigOrDefault('PGVECTOR_COL_VECTOR', 'embedding');
      const useSSL = this.getConfigOrDefault<string>('PGVECTOR_SSL', 'false') === 'true';
    
      console.log('🔄 Parseando la URL de conexión:', connectionUrl.replace(/:[^:]*@/, ':****@'));
      
      let connectionOptions: any;
      
      try {
        // Supabase URLs tienen formato postgresql://user:password@host:port/database
        const urlParts = connectionUrl.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/);
        
        if (!urlParts) {
          throw new Error('Formato de URL no reconocido');
        }
        
        const [_, username, password, host, port, database] = urlParts;
        
        console.log('🔍 Detalles extraídos de URL:', {
          username,
          password: '****', // No mostrar contraseña
          host,
          port,
          database
        });
        
        // Crear configuración de conexión directa
        connectionOptions = {
          user: username,
          password: password,
          host: host,
          port: parseInt(port),
          database: database,
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        };
        
        console.log('✅ Opciones de conexión construidas manualmente desde URL de entorno');
      } catch (parseError) {
        console.error('❌ Error al analizar URL:', parseError);
        throw parseError;
      }
    
      // Comprobar que la contraseña es un string
      if (typeof connectionOptions.password !== 'string') {
        console.error('⚠️ ERROR CRÍTICO: La contraseña no es un string:', typeof connectionOptions.password);
        throw new Error('La contraseña debe ser un string');
      }
      
      console.log('🔍 Opciones de conexión finales (tipos):', {
        user: typeof connectionOptions.user,
        password: typeof connectionOptions.password,
        host: typeof connectionOptions.host,
        port: typeof connectionOptions.port,
        database: typeof connectionOptions.database,
        ssl: typeof connectionOptions.ssl
      });
    
      console.log('⏳ Inicializando conexión a PGVectorStore...');
      
      try {
        this.vectorStore = await PGVectorStore.initialize(
          this.embeddingsGenerator,
          {
            postgresConnectionOptions: {
              type: 'postgres',
              ...connectionOptions
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
        console.log('✅ Vector Store inicializado correctamente');
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
      
      // Priorizar la conexión existente si está disponible
      if (this.existingDataSource) {
        console.log('🔄 Usando conexión existente para Vector Store');
        await this.initializeFromExistingConnection();
      } else {
        console.log('🔄 Creando nueva conexión para Vector Store');
        await this.initializeVectorStore();
      }
    }
    return this.vectorStore;
  }

  async save(embedding: Embedding): Promise<void> {
    try {
      const vectorStore = await this.getVectorStore();

      // Convertir el embedding a un documento de langchain
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