import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackofficeToolController } from './BackofficeToolcontroller';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { ToolExportCommandHandler } from '@Web/Tool/Application/ToolExportCommandHandler';
import { GoogleGeminiProvider } from '@Shared/Infrastructure/IA/GoogleGeminiProvider';
import { BackofficeFuturpediaToolModule } from './Futurpedia/BackofficeFuturpediaToolModule';
import { BackofficeFuturpediaToolTestModule } from './Futurpedia/BackofficeFuturpediaToolTestModule';
import { ToolRepositoryModule } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { EventSchema } from 'src/Events/Event/Infrastructure/Persistence/TypeOrm/event.schema';

@Module({
    imports: [
        BackofficeFuturpediaToolModule,
        BackofficeFuturpediaToolTestModule,
        ToolRepositoryModule,
        CqrsModule,
        TypeOrmModule.forFeature([EventSchema])
    ],
    controllers: [
        BackofficeToolController
    ],
    providers: [
        GoogleGeminiProvider,
        ToolExportCommandHandler,
        {
            provide: TOOL_TABLE_SUFFIX,
            useValue: process.env.TOOL_TABLE_SUFFIX || ''
        },
        {
            provide: ToolRepository,
            useFactory: (dataSource: DataSource, suffix: string) => {
                return new ToolTypeormRepository(dataSource, suffix);
            },
            inject: [DataSource, TOOL_TABLE_SUFFIX]
        },
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class BackofficeToolModule {} 
