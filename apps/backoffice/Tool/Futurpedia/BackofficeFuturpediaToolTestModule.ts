import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { ImportToolByLinkCommandHandler } from '@Backoffice/Tool/Application/ImportToolCommandHandler';
import { UpdateFuturpediaTool } from '@Backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from '@Backoffice/Tool/Application/UpdateToolByLinkCommandHandler';
import { ImportFuturpediaTool } from '@Backoffice/Tool/Infrastructure/ImportFuturpediaTool';
import { FuturpediaTestController } from './futurpedia.test.controller';
import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
import { PuppeterScrapConnectionProvider } from '@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider';
import { PlaywrightScrapProvider } from '@Shared/Infrastructure/Scrap/PlaywrightScrapProvider';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaTestController
    ],
    providers: [
        ImportToolByLinkCommandHandler,
        UpdateToolByLinkCommandHandler,
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        }, 
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        },
        {
            provide: 'ImportToolInterface',
            useClass: ImportFuturpediaTool,
        },
        {
            provide: 'UpdateToolInterface',
            useClass: UpdateFuturpediaTool,
        },
        {
            provide: ScrapConnectionProvider,
            useClass: PuppeterScrapConnectionProvider
            // useClass: PlaywrightScrapProvider,
        }
    ]
 })
export class BackofficeFuturpediaToolTestModule {}
