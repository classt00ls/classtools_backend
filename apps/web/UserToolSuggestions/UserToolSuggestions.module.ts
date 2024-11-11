import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { OllamaMistralUserToolSuggestionsRepository } from 'src/web/Infrastructure/Repository/UserToolSuggestions/OllamaMistralUserToolSuggestionsRepository';
import { UserToolSuggestionsController } from './UserToolSuggestions.controller';
import { TypeormUserWebRepository } from 'src/web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { UserWebRepository } from 'src/web/Domain/Repository/UserWeb/UserWebRepository';
import { UserWebSchema } from 'src/web/Infrastructure/Persistence/typeorm/DatabaseWebUser.schema';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserWebSchema,
            UserWebRepository
          ]),
        CqrsModule
    ],
    controllers: [
        UserToolSuggestionsController
    ],
    providers: [
        {
            provide: UserWebRepository,
            useClass: TypeormUserWebRepository
        },
        {
            provide: UserToolSuggestionsRepository,
            useClass: OllamaMistralUserToolSuggestionsRepository,
        },
        {
            provide: 'UserToolSuggestionsSearcher',
            useClass: UserToolSuggestionsSearcher
        }
    ]
 })
export class UserToolSuggestionsModule {}
