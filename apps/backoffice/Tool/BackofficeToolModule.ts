import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { BackofficeToolController } from './BackofficeToolcontroller';
import { ImportTool } from 'src/backoffice/Infrastructure/Import/puppeter/Tool/ImportTool';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { ImportToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommandHandler';
import { FuturpediaController } from './Futurpedia/futurpedia.controller';
import { GetFuturpediaPageLinks } from 'src/backoffice/Infrastructure/Import/puppeter/Tool/Futurpedia/GetFuturpediaPageLinks';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/backoffice/Application/Query/Tool/Futurpedia/GetAllFuturpediaPageLinksQueryHandler';


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
            useClass: ImportTool,
        },
        {
            provide: 'GetFuturpediaPageLinksInterface',
            useClass: GetFuturpediaPageLinks
        }
    ]
 })
export class BackofficeToolModule {}
