import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@Backoffice/Tag/Domain/tag.repository';
import { ImportToolByLinkCommandHandler } from '@Backoffice/Tool/Application/ImportToolCommandHandler';
import { UpdateFuturpediaTool } from '@Backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from '@Backoffice/Tool/Application/UpdateToolByLinkCommandHandler';

import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
import { ChatTogetherModelProvider } from '@Shared/Infrastructure/IA/ChatTogetherModelProvider';
import { ScrapToolFromFuturpedia } from '@Backoffice/Tool/Infrastructure/ScrapToolFromFuturpedia';
import { TagCreator } from '@Backoffice/Tag/Domain/TagCreator';
import { ToolCreator } from '@Backoffice/Tool/Domain/ToolCreator';
import { FuturpediaController } from './futurpedia.controller';
import { PuppeterScrapConnectionProvider } from '@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaController
    ],
    providers: [
        TagCreator,
        ToolCreator,
        ImportToolByLinkCommandHandler,
        UpdateToolByLinkCommandHandler,
        ChatTogetherModelProvider,
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
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
            provide: ScrapConnectionProvider,
            useClass: PuppeterScrapConnectionProvider
            // useClass: PlaywrightScrapProvider
        }
    ]
 })
export class BackofficeFuturpediaToolModule {}
