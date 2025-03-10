import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ToolSchema } from '@Backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from '@Backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { DiscoverToolcontroller } from './DiscoverToolcontroller';
import { SuggestionsGenerator } from 'src/discover/Domain/Tool/SuggestionsGenerator';
import { OllamaGemmaToolSuggestionsGenerator } from 'src/discover/Infrastructure/Ollama/OllamaGemmaToolSuggestionsGenerator';
import { GetSuggestedToolsByUserDescriptionQueryHandler } from 'src/discover/Application/query/Tool/GetSuggestedToolsByUserDescriptionQueryHandler';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema
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
            provide: TOOL_TABLE_SUFFIX,
            useValue: process.env.TOOL_TABLE_SUFFIX || ''
        },
        {
            provide: ToolRepository,
            useFactory: (dataSource: DataSource, suffix: string) => {
                return new ToolTypeormRepository(dataSource, suffix);
            },
            inject: [DataSource, TOOL_TABLE_SUFFIX]
        }
    ]
 })
export class DiscoverToolModule {} 
