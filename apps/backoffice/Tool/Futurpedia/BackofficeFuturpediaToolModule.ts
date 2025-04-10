import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createToolSchema } from '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { ImportToolByLinkCommandHandler } from '@backoffice/Tool/Application/ImportToolByLinkCommandHandler';
import { UpdateFuturpediaTool } from '@backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from '@backoffice/Tool/Application/UpdateToolByLinkCommandHandler';

import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { ScrapToolFromFuturpedia } from '@backoffice/Tool/Infrastructure/ScrapToolFromFuturpedia';
import { TagCreator } from '@backoffice/Tag/Domain/TagCreator';
import { ToolCreator } from '@backoffice/Tool/Domain/ToolCreator';
import { ToolUpdater } from '@backoffice/Tool/Domain/ToolUpdater';
import { FuturpediaController } from './futurpedia.controller';
import { PuppeterScrapConnectionProvider } from '@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider';
import { HtmlToolParamsExtractor } from '@backoffice/Tool/Infrastructure/agent/HtmlToolParamsExtractor';
import { ScrapToolLinksFromFuturpedia } from '@backoffice/Tool/Infrastructure/ScrapToolLinksFromFuturpedia';
import { EventOutboxRepository } from '@Shared/Infrastructure/Event/event-outbox.repository';
import { CreateEventCommandHandler } from '@Events/Event/Application/Create/CreateEventCommandHandler';
import { EventCreator } from '@Events/Event/Domain/EventCreator';
import { EventSchema } from 'src/Events/Event/Infrastructure/Persistence/TypeOrm/event.schema';
import { TypeOrmEventRepository } from '@Events/Event/Infrastructure/Persistence/TypeOrm/TypeOrmEventRepository';

// Crear los schemas para cada idioma
const ToolSchemaEs = createToolSchema('_es');
const ToolSchemaEn = createToolSchema('_en');

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchemaEs,
            ToolSchemaEn,
            EventSchema,
            TypeOrmEventRepository
        ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaController
    ],
    providers: [
        TagCreator,
        ToolCreator,
        ToolUpdater,
        ImportToolByLinkCommandHandler,
        UpdateToolByLinkCommandHandler,
        CreateEventCommandHandler,
        ChatTogetherModelProvider,
        EventCreator,
        EventOutboxRepository,
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
        },
        {
            provide: 'ScrapTool',
            useClass: ScrapToolFromFuturpedia,
        },
        {
            provide: 'UpdateToolInterface',
            useClass: UpdateFuturpediaTool,
        },
        {
            provide: 'ToolParamsExtractor',
            useClass: HtmlToolParamsExtractor,
        },
        {
            provide: ScrapConnectionProvider,
            useClass: PuppeterScrapConnectionProvider
        },
        {
            provide: 'ScrapToolLinks',
            useClass: ScrapToolLinksFromFuturpedia,
        },
        {
            provide: 'EventRepository',
            useClass: TypeOrmEventRepository
        }
    ]
})
export class BackofficeFuturpediaToolModule {}
