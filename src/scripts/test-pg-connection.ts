import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PGVectorEmbeddingRepository } from '../Shared/Embedding/Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository';

async function testConnection() {
  try {
    console.log('🚀 Iniciando prueba de conexión a PG Vector...');
    // Configuración similar a la de la aplicación
    const configService = new ConfigService({
      PGVECTOR_HOST: 'db.mrdvfjqdmxqmrtzhhfms.supabase.co',
      PGVECTOR_PORT: '5432',
      PGVECTOR_USER: 'postgres',
      PGVECTOR_PASSWORD: 'tz1D6kj9CNHwHGJA',
      PGVECTOR_DB: 'classtools',
      PGVECTOR_SSL: 'false',
      OLLAMA_BASE_URL: 'http://localhost:11434',
      OLLAMA_EMBEDDINGS_MODEL: 'nomic-embed-text',
      PGVECTOR_TABLE: 'embeddings',
      PGVECTOR_COL_ID: 'id',
      PGVECTOR_COL_CONTENT: 'content',
      PGVECTOR_COL_METADATA: 'metadata',
      PGVECTOR_COL_VECTOR: 'embedding',
    });
    
    console.log('⏳ Inicializando conexión a base de datos...');
    // Crear una conexión de prueba
    const dataSource = new DataSource({
      type: 'postgres',
      host: 'db.mrdvfjqdmxqmrtzhhfms.supabase.co',
      port: 5432,
      username: 'postgres',
      password: 'tz1D6kj9CNHwHGJA',
      database: 'classtools',
      ssl: false,
    });
    
    await dataSource.initialize();
    console.log('✅ Conexión a base de datos establecida correctamente');
    
    // Probar repositorio
    console.log('🔍 Inicializando repositorio de embeddings...');
    const repo = new PGVectorEmbeddingRepository(configService, dataSource);
    
    // Test simple
    console.log('🔍 Realizando búsqueda de prueba...');
    const result = await repo.search('test query', 1);
    console.log('🔍 Resultado de búsqueda:', result);
    
    await dataSource.destroy();
    console.log('✅ Prueba completada satisfactoriamente');
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testConnection().catch(err => {
  console.error('❌ Error ejecutando la prueba:', err);
  process.exit(1);
}); 