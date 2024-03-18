import { Module } from '@nestjs/common';
import { FuturpediaController } from './futurpedia.controller';
import { GetAllFuturpediaHomeToolsQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaHomeToolsQueryHandler';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { TagSchema } from 'src/Infrastructure/Persistence/typeorm/tag.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { TagRepository } from 'src/Domain/Repository/tag.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            TagSchema,
            ToolRepository,
            TagRepository
          ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaController
    ],
    providers: [
        GetAllFuturpediaHomeToolsQueryHandler,
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