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
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { EmbeddingsProviderFactory } from './Infrastructure/EmbeddingsProviderFactory';

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
    {
        provide: 'PGVectorStore',
        useFactory: async (dataSource: DataSource, configService: ConfigService) => {
            const embeddingsGenerator = EmbeddingsProviderFactory.create(configService);
            
            return await PGVectorStore.initialize(
                embeddingsGenerator,
                {
                    postgresConnectionOptions: {
                        type: 'postgres',
                        // Usamos la conexión existente del dataSource
                        ...dataSource.options
                    },
                    tableName: 'embeddings',
                    columns: {
                        idColumnName: 'id',
                        contentColumnName: 'content',
                        metadataColumnName: 'metadata',
                        vectorColumnName: 'embedding',
                    },
                    distanceStrategy: 'cosine',
                }
            );
        },
        inject: [DataSource, ConfigService] // Inyectamos la conexión global
    }
],
exports: ['PGVectorStore']
})
export class LangChainEmbeddingsModule {} 