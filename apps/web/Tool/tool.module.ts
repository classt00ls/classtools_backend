import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { ToolController } from './tool.controller';
import { GetAllToolsQueryHandler } from 'src/web/Application/Query/Tool/GetAllToolsQueryHandler';
import { CountToolsQueryHandler } from 'src/web/Application/Query/Tool/CountToolsQueryHandler';
import { GetDetailToolQueryHandler } from 'src/web/Application/Query/Tool/GetDetailToolQueryHandler';
import { GetFilteredToolsQueryHandler } from 'src/web/Application/Query/Tool/GetFilteredToolsQueryHandler';


@Module({
    imports: [
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
        CountToolsQueryHandler,
        GetAllToolsQueryHandler,
        GetDetailToolQueryHandler,
        GetFilteredToolsQueryHandler,
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        }
    ]
 })
export class ToolModule {}
