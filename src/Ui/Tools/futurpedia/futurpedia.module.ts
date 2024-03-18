import { Module } from '@nestjs/common';
import { FuturpediaController } from './futurpedia.controller';
import { GetAllFuturpediaHomeToolsQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaHomeToolsQueryHandler';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Infrastructure/Persistence/typeorm/tool.schema';
import { TagSchema } from 'src/Infrastructure/Persistence/typeorm/tag.schema';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            TagSchema
          ]),
        CqrsModule
    ],
    controllers: [
        FuturpediaController
    ],
    providers: [
        GetAllFuturpediaHomeToolsQueryHandler
    ]
 })
export class FuturpediaModule {}
