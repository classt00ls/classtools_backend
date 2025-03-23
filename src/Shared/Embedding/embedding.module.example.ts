import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmbeddingRepository } from './Domain/EmbeddingRepository';
import { EmbeddingResponseService } from './Domain/EmbeddingResponseService';
import { PGVectorEmbeddingRepository } from './Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository';
import { OllamaEmbeddingResponseService } from './Infrastructure/OllamaEmbeddingResponseService';

/**
 * Ejemplo de configuración del módulo de embeddings utilizando
 * variables de entorno y ConfigModule
 */
@Module({
  imports: [
    // Importamos ConfigModule para acceder a las variables de entorno
    ConfigModule,
  ],
  providers: [
    // Proporcionamos la implementación del repositorio
    {
      provide: EmbeddingRepository,
      useClass: PGVectorEmbeddingRepository,
    },
    // Proporcionamos la implementación del servicio de respuestas
    {
      provide: EmbeddingResponseService,
      useClass: OllamaEmbeddingResponseService,
    },
  ],
  exports: [
    // Exportamos las interfaces para que otros módulos puedan usarlas
    EmbeddingRepository,
    EmbeddingResponseService,
  ],
})
export class EmbeddingModule {} 