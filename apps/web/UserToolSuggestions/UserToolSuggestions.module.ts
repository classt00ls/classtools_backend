import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion.ts/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { OllamaMistralUserToolSuggestionsRepository } from 'src/web/Infrastructure/Repository/UserToolSuggestions/OllamaMistralUserToolSuggestionsRepository';
import { UserToolSuggestionsController } from './UserToolSuggestions.controller';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema,
            ToolRepository
          ]),
        CqrsModule
    ],
    controllers: [
        UserToolSuggestionsController
    ],
    providers: [
        UserToolSuggestionsSearcher,
        {
            provide: UserToolSuggestionsRepository,
            useClass: OllamaMistralUserToolSuggestionsRepository,
        }
    ]
 })
export class UserToolSuggestionsModule {}
