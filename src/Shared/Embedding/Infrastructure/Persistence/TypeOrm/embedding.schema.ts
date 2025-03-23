import { EntitySchema } from 'typeorm';

/**
 * Esquema de entidad para embeddings
 * 
 * Define la estructura de la tabla de embeddings en PostgreSQL con soporte para PGVector
 * 
 * =========================================================================
 * NOTA IMPORTANTE: Este esquema es EXCLUSIVAMENTE para documentación.
 * =========================================================================
 * 
 * No se utiliza realmente en la aplicación porque PGVectorEmbeddingRepository 
 * utiliza PGVectorStore de LangChain que gestiona su propia conexión a la 
 * base de datos y ejecuta operaciones SQL directamente sin pasar por TypeORM.
 * 
 * Si en algún momento se decide utilizar también TypeORM para acceder a los 
 * embeddings, este esquema serviría como punto de partida, pero requeriría:
 * 
 * 1. Tener la extensión pgvector instalada en PostgreSQL con: CREATE EXTENSION IF NOT EXISTS vector;
 * 2. Crear los índices manualmente después de la migración, ya que TypeORM no soporta
 *    nativamente los índices específicos de pgvector:
 *    - CREATE INDEX embeddings_vector_idx ON embeddings USING ivfflat (vector vector_cosine_ops);
 *    - CREATE INDEX embeddings_metadata_idx ON embeddings USING gin (metadata);
 */
export const EmbeddingSchema = new EntitySchema({
  name: 'embedding',
  tableName: 'embeddings',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    content: {
      type: 'text',
      nullable: false,
    },
    metadata: {
      type: 'jsonb',
      nullable: true,
      default: '{}',
    },
    vector: {
      // En TypeORM no podemos usar 'vector' directamente como tipo
      // Usamos text o simple-array y luego en la migración/SQL directo cambiamos a vector
      type: 'text',
      nullable: true,
      comment: 'Vector de embedding generado para el contenido (tipo vector de pgvector)',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamp',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamp',
      updateDate: true,
    },
  },
  indices: [
    // Nota: Los índices especializados de pgvector no se pueden definir aquí
    // Se crean mediante SQL directo después de la migración
    {
      name: 'embeddings_vector_idx',
      columns: ['vector'],
      // Quitamos using: 'ivfflat' porque no es compatible con TypeORM
      // Se debe crear manualmente con SQL
    },
    {
      name: 'embeddings_metadata_idx',
      columns: ['metadata'],
      // Quitamos using: 'gin' porque no es compatible con TypeORM
      // Se debe crear manualmente con SQL
    },
  ],
}); 