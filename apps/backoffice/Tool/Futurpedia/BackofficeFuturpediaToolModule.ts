import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.repository.module';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@Backoffice/Tag/Domain/tag.repository';
import { ImportToolByLinkCommandHandler } from '@Backoffice/Tool/Application/ImportToolByLinkCommandHandler';
import { UpdateFuturpediaTool } from '@Backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from '@Backoffice/Tool/Application/UpdateToolByLinkCommandHandler';

import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { ScrapToolFromFuturpedia } from '@Backoffice/Tool/Infrastructure/ScrapToolFromFuturpedia';
import { TagCreator } from '@Backoffice/Tag/Domain/TagCreator';
import { ToolCreator } from '@Backoffice/Tool/Domain/ToolCreator';
import { ToolUpdater } from '@Backoffice/Tool/Domain/ToolUpdater';
import { FuturpediaController } from './futurpedia.controller';
import { PuppeterScrapConnectionProvider } from '@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider';
import { HtmlToolParamsExtractor } from '@Backoffice/Tool/Infrastructure/agent/HtmlToolParamsExtractor';
import { ScrapToolLinksFromFuturpedia } from '@Backoffice/Tool/Infrastructure/ScrapToolLinksFromFuturpedia';
import { ScrapToolLinks } from '@Backoffice/Tool/Domain/ScrapToolLinks';    

// Crear los schemas para cada idioma
const ToolSchemaEs = createToolSchema('_es');
const ToolSchemaEn = createToolSchema('_en');

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchemaEs,
            ToolSchemaEn
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
        ChatTogetherModelProvider,
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
        }
    ]
})
export class BackofficeFuturpediaToolModule {}
