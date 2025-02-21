import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { OpenAIcontroller } from './OpenAIcontroller';
import { OpenAITextGenerator } from 'src/discover/Infrastructure/openAI/OpenAITextGenerator';
import { OpenAIImageFromPromptGenerator } from 'src/discover/Infrastructure/openAI/OpenAIImageFromPromptGenerator';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
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
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        },
        {
            provide: TagRepository,
            useClass: TagTypeormRepository,
        }
    ]
 })
export class OpenAIModule {} 
