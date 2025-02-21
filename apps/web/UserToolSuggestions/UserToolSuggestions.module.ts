import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserToolSuggestionsController } from './UserToolSuggestions.controller';
import { TypeormUserWebRepository } from 'src/web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { UserWebRepository } from 'src/web/Domain/Repository/UserWeb/UserWebRepository';
import { UserWebSchema } from 'src/web/Infrastructure/Persistence/typeorm/DatabaseWebUser.schema';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';
import { ToolWebSchema } from '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';
import { PostgreToolVectorRepository } from '@Web/Tool/Infrastructure/Persistence/Postgre/PostgreToolVectorRepository';
import { ToolVectorRepository } from '@Web/Tool/Domain/tool.vector.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserWebSchema,
            ToolWebSchema,
            UserWebRepository
          ]),
        CqrsModule
    ],
    controllers: [
        UserToolSuggestionsController
    ],
    providers: [
        {
            provide: ToolVectorRepository,
            useClass: PostgreToolVectorRepository
        },
        {
            provide: UserWebRepository,
            useClass: TypeormUserWebRepository
        },
        {
            provide: UserToolSuggestionsRepository,
            useClass: OllamaLangchainUserToolSuggestionsRepository,
        },
        {
            provide: 'UserToolSuggestionsSearcher',
            useClass: UserToolSuggestionsSearcher
        }
    ]
 })
export class UserToolSuggestionsModule {}
