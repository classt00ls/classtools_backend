import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { ImportToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommandHandler';
import { GetFuturpediaPageLinks } from 'src/backoffice/Infrastructure/Import/Tool/Futurpedia/GetFuturpediaPageLinks';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/backoffice/Application/Query/Tool/Futurpedia/GetAllFuturpediaPageLinksQueryHandler';
import { UpdateFuturpediaTool } from 'src/backoffice/Infrastructure/Import/Tool/Futurpedia/UpdateFuturpediaTool';
import { UpdateToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/UpdateToolByLinkCommandHandler';
import { ImportFuturpediaTool } from 'src/backoffice/Infrastructure/Import/Tool/Futurpedia/ImportFuturpediaTool';
import { FuturpediaController } from './futurpedia.controller';
import { BackofficeToolController } from '../BackofficeToolcontroller';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        BackofficeToolController,
        FuturpediaController
    ],
    providers: [
        ImportToolByLinkCommandHandler,
        GetAllFuturpediaPageLinksQueryHandler,
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
            provide: 'GetFuturpediaPageLinksInterface', 
            useClass: GetFuturpediaPageLinks
        }
    ]
 })
export class BackofficeFuturpediaToolModule {}
