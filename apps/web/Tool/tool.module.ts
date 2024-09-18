import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { GetAllFuturpediaPageLinksQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaPageLinksQueryHandler';
import { ImportToolByLinkCommandHandler } from 'src/Application/command/tools/ImportToolByLinkCommandHandler';
import { GetAllToolsQueryHandler } from 'src/Application/query/tools/GetAllToolsQueryHandler';
import { GetAllTagsQueryHandler } from 'src/Application/query/tools/GetAllTagsQueryHandler';
import { FuturpediaModule } from 'src/Ui/Tools/futurpedia/futurpedia.module';
import { ToolController } from './tool.controller';


@Module({
    imports: [
        FuturpediaModule,
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        ToolController
    ],
    providers: [
        GetAllToolsQueryHandler,
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        }
    ]
 })
export class ToolModule {}
