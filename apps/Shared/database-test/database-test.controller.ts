import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OllamaEmbeddings } from '@langchain/ollama';
import { InjectDataSource } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PostgresRepository } from '@Shared/Infrastructure/Persistence/postgres/PostgresRepository';

@Controller('database-test')
export class DatabaseTestController {
  private postgresRepo: PostgresRepository;

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private configService: ConfigService
  ) {
    // Usamos el constructor de PostgresRepository que ya utiliza variables de entorno
    this.postgresRepo = new class extends PostgresRepository {
      protected toAggregate(row: any): any {
        return row;
      }
    }();
  }

  @Get('db-status')
  async checkMainDatabase() {
    try {
      // Probar si la conexión a la base de datos está funcionando
      const isConnected = this.dataSource.isInitialized;
      
      // Ejecutar una consulta simple
      const result = await this.dataSource.query('SELECT NOW() as time');
      
      return {
        status: 'success',
        connected: isConnected,
        timestamp: result[0]?.time || new Date(),
        message: 'Conexión a la base de datos principal funciona correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al conectar con la base de datos principal',
        error: error.message
      };
    }
  }

  @Get('postgres-repo-status')
  async checkPostgresRepoConnection() {
    try {
      // Ejecutar una consulta simple usando el método de PostgresRepository
      const result = await this.postgresRepo['searchOne']`SELECT NOW() as time`;
      
      return {
        status: 'success',
        connected: true,
        timestamp: result?.time || new Date(),
        message: 'Conexión a través de PostgresRepository funciona correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al conectar con PostgreSQL utilizando PostgresRepository',
        error: error.message
      };
    }
  }

  @Get('ollama-status')
  async checkOllamaConnection() {
    try {
      // Obtener los parámetros de conexión desde variables de entorno
      const model = this.configService.get<string>('OLLAMA_MODEL', 'embeddings');
      const baseUrl = this.configService.get<string>('OLLAMA_BASE_URL', 'http://localghost:11434');
      
      // Crear una instancia de OllamaEmbeddings con parámetros de env
      const ollamaEmbeddings = new OllamaEmbeddings({
        model,
        baseUrl,
      });

      // Intentar generar embeddings con una palabra de prueba
      const embeddings = await ollamaEmbeddings.embedDocuments(['prueba']);
      
      return {
        status: 'success',
        connected: embeddings.length > 0,
        embeddingsSize: embeddings[0]?.length || 0,
        model,
        baseUrl,
        message: 'Conexión a Ollama funciona correctamente'
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Error al conectar con Ollama',
        error: error.message
      };
    }
  }
} 