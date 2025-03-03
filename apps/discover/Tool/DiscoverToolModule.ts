import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
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
