import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

// Domain
// (Los imports de dominio son interfaces, no necesitan ser registrados)

// Application - Commands & Handlers
import { CreateEmbeddingCommandHandler } from './Application/create/CreateEmbeddingCommandHandler';
import { UpdateEmbeddingCommandHandler } from './Application/update/UpdateEmbeddingCommandHandler';
import { GetEmbeddingResponseCommandHandler } from './Application/respond/GetEmbeddingResponseCommandHandler';

// Application - Services
import { EmbeddingCreator } from './Application/create/EmbeddingCreator';
import { EmbeddingUpdater } from './Application/update/EmbeddingUpdater';
import { EmbeddingMetadataUpdater } from './Application/update-metadata/EmbeddingMetadataUpdater';
import { EmbeddingDeleter } from './Application/delete/EmbeddingDeleter';
import { EmbeddingSearcher } from './Application/search/EmbeddingSearcher';
import { EmbeddingBatchProcessor } from './Application/batch/EmbeddingBatchProcessor';

// Infrastructure
import { EmbeddingQueryController } from '@Shared/Embedding/Infrastructure/Controllers/EmbeddingQueryController';
import { PGVectorEmbeddingRepository } from './Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository';
import { OllamaEmbeddingResponseService } from './Infrastructure/OllamaEmbeddingResponseService';

const CommandHandlers = [
  CreateEmbeddingCommandHandler,
  UpdateEmbeddingCommandHandler,
  GetEmbeddingResponseCommandHandler,
  // Añadir otros handlers aquí
];

const ApplicationServices = [
  EmbeddingCreator,
  EmbeddingUpdater,
  EmbeddingMetadataUpdater,
  EmbeddingDeleter,
  EmbeddingSearcher,
  EmbeddingBatchProcessor,
];

const Controllers = [
  EmbeddingQueryController
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    // Otros módulos necesarios
  ],
  controllers: [
    ...Controllers
  ],
  providers: [
    // Command Handlers
    ...CommandHandlers,
    
    // Application Services
    ...ApplicationServices,
    
    // Repositories
    {
      provide: 'EmbeddingRepository',
      useClass: PGVectorEmbeddingRepository,
    },
    
    // Domain Services
    {
      provide: 'EmbeddingResponseService',
      useClass: OllamaEmbeddingResponseService,
    },
  ],
  exports: [
    // Exportar los servicios o comandos que se necesiten en otros módulos
    CqrsModule,
  ]
})
export class EmbeddingModule {} 