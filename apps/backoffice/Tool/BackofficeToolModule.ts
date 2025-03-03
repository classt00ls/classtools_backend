import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { BackofficeToolController } from './BackofficeToolcontroller';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@Backoffice/Tag/Domain/tag.repository';
import { ToolExportCommandHandler } from '@Web/Tool/Application/ToolExportCommandHandler';
import { GoogleGeminiProvider } from '@Shared/Infrastructure/IA/GoogleGeminiProvider';
import { BackofficeFuturpediaToolModule } from './Futurpedia/BackofficeFuturpediaToolModule';
import { BackofficeFuturpediaToolTestModule } from './Futurpedia/BackofficeFuturpediaToolTestModule';


@Module({
    imports: [
        BackofficeFuturpediaToolModule,
        BackofficeFuturpediaToolTestModule,
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
        GoogleGeminiProvider,
        ToolExportCommandHandler,
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
