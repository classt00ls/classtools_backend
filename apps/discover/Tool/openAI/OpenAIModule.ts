import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ToolSchema } from '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from '@backoffice/Tag/Domain/tag.repository';
import { OpenAIcontroller } from './OpenAIcontroller';
import { OpenAITextGenerator } from 'src/discover/Infrastructure/openAI/OpenAITextGenerator';
import { OpenAIImageFromPromptGenerator } from 'src/discover/Infrastructure/openAI/OpenAIImageFromPromptGenerator';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema
          ]),
        CqrsModule
    ],
    controllers: [
        OpenAIcontroller
    ],
    providers: [
        OpenAITextGenerator,
        OpenAIImageFromPromptGenerator,
        {
            provide: TOOL_TABLE_SUFFIX,
            useValue: process.env.TOOL_TABLE_SUFFIX || ''
        },
        {
            provide: ToolRepository,
            useFactory: (dataSource: DataSource, suffix: string) => {
                return new ToolTypeormRepository(dataSource, suffix);
            },
            inject: [DataSource, TOOL_TABLE_SUFFIX]
        },
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class OpenAIModule {} 
