import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from 'src/backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { ImportToolByLinkCommandHandler } from 'src/backoffice/Tool/Application/ImportToolCommandHandler';
import { UpdateFuturpediaTool } from 'src/backoffice/Tool/Infrastructure/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from 'src/backoffice/Tool/Application/UpdateToolByLinkCommandHandler';
import { ImportFuturpediaTool } from 'src/backoffice/Tool/Infrastructure/ImportFuturpediaTool';
import { FuturpediaController } from './futurpedia.controller';
import { ScrapConnectionProvider } from '@Shared/Domain/Service/Tool/ScrapConnectionProvider';
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
            useClass: PuppeterScrapConnectionProvider,
        }
    ]
 })
export class BackofficeFuturpediaToolModule {}
