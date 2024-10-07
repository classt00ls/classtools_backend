import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { BackofficeToolController } from './BackofficeToolcontroller';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { ImportToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommandHandler';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/backoffice/Application/Query/Tool/Futurpedia/GetAllFuturpediaPageLinksQueryHandler';
import { UpdateToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/UpdateToolByLinkCommandHandler';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        BackofficeToolController
    ],
    providers: [
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        },
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class BackofficeToolModule {} 
