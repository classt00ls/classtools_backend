import { Module } from '@nestjs/common';
import { FuturpediaController } from './futurpedia.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaPageLinksQueryHandler';
import { ImportToolByLinkCommandHandler } from 'src/Application/command/tools/ImportToolByLinkCommandHandler';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository,
          ]),
        CqrsModule
    ],
    controllers: [
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
        }
    ]
 })
export class FuturpediaModule {}
