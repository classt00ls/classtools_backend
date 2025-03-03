import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from 'src/backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { TagTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tag.typeorm.repository';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { DiscoverToolcontroller } from './DiscoverToolcontroller';
import { SuggestionsGenerator } from 'src/discover/Domain/Tool/SuggestionsGenerator';
import { OllamaGemmaToolSuggestionsGenerator } from 'src/discover/Infrastructure/Ollama/OllamaGemmaToolSuggestionsGenerator';
import { GetSuggestedToolsByUserDescriptionQueryHandler } from 'src/discover/Application/query/Tool/GetSuggestedToolsByUserDescriptionQueryHandler';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        DiscoverToolcontroller
    ],
    providers: [
        GetSuggestedToolsByUserDescriptionQueryHandler,
        {
            provide: SuggestionsGenerator,
            useClass: OllamaGemmaToolSuggestionsGenerator,
        },
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        }
    ]
 })
export class DiscoverToolModule {} 
