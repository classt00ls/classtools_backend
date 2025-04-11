import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

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
import { MockPGVectorEmbeddingRepository } from './Infrastructure/Persistence/Mock/MockPGVectorEmbeddingRepository';
import { EmbeddingRepository } from './Domain/EmbeddingRepository';

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
      useFactory: (configService: ConfigService, dataSource: DataSource) => {
        console.log('🔍 Inicializando EmbeddingRepository...');
        
        try {
          // Decidir qué implementación usar
          const useMock = configService.get<string>('USE_MOCK_EMBEDDINGS') === 'true';
          
          if (useMock) {
            console.log('⚠️ Usando implementación MOCK de EmbeddingRepository');
            return new MockPGVectorEmbeddingRepository();
          } else {
            console.log('✅ Usando implementación REAL de EmbeddingRepository con la conexión principal');
            
            try {
              return new PGVectorEmbeddingRepository(configService, dataSource);
            } catch (error) {
              console.error('❌ Error al crear PGVectorEmbeddingRepository:', error);
              console.log('⚠️ Fallback a implementación MOCK por error');
              return new MockPGVectorEmbeddingRepository();
            }
          }
        } catch (error) {
          console.error('❌ Error en factory de EmbeddingRepository:', error);
          console.log('⚠️ Fallback a implementación MOCK por error');
          return new MockPGVectorEmbeddingRepository();
        }
      },
      inject: [ConfigService, DataSource],
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
    'EmbeddingRepository',
    'EmbeddingResponseService'
  ]
})
export class EmbeddingModule {} 