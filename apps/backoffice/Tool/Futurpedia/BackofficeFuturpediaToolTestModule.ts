import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ToolSchema } from '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { ImportToolByLinkCommandHandler } from '@backoffice/Tool/Application/ImportToolByLinkCommandHandler';
import { UpdateFuturpediaTool } from '@backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from '@backoffice/Tool/Application/UpdateToolByLinkCommandHandler';
import { FuturpediaTestController } from './futurpedia.test.controller';
import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
import { PlaywrightScrapProvider } from '@Shared/Infrastructure/Scrap/PlaywrightScrapProvider';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { ScrapToolFromFuturpedia } from '@backoffice/Tool/Infrastructure/ScrapToolFromFuturpedia';
import { TagCreator } from '@backoffice/Tag/Domain/TagCreator';
import { ToolCreator } from '@backoffice/Tool/Domain/ToolCreator';
import { ToolUpdater } from '@backoffice/Tool/Domain/ToolUpdater';
import { PuppeterScrapConnectionProvider } from '@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider';
import { HtmlToolParamsExtractor } from '@backoffice/Tool/Infrastructure/agent/HtmlToolParamsExtractor';
import { ScrapToolLinksFromFuturpedia } from '@backoffice/Tool/Infrastructure/ScrapToolLinksFromFuturpedia';
import { ScrapToolLinks } from '@backoffice/Tool/Domain/ScrapToolLinks';    
import { EventOutboxRepository } from '@Shared/Infrastructure/Event/event-outbox.repository';
@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema
          ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaTestController
    ],
    providers: [
        TagCreator,
        ToolCreator,
        ToolUpdater,
        ImportToolByLinkCommandHandler,
        UpdateToolByLinkCommandHandler,
        ChatTogetherModelProvider,
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
        }
    ]
 })
export class BackofficeFuturpediaToolTestModule {}
