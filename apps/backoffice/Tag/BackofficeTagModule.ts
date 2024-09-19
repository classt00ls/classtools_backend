import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaPageLinksQueryHandler';
import { ImportToolByLinkCommandHandler } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommandHandler';
import { BackofficeTagController } from './BackofficeTagController';
import { BackofficeCategoryController } from './Category/BackofficeCategoryController';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        BackofficeTagController,
        BackofficeCategoryController
    ],
    providers: [
        ImportToolByLinkCommandHandler,
        GetAllFuturpediaPageLinksQueryHandler,
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class BackofficeTagModule {}
