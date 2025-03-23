import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserToolSuggestionsController } from './UserToolSuggestions.controller';
import { TypeormUserWebRepository } from '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/TypeormUserWebRepository';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';
import { UserWebSchema } from '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/DatabaseWebUser.schema';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';
import { ToolWebSchema } from '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';
import { PostgreToolVectorRepository } from '@Web/Tool/Infrastructure/Persistence/Postgre/PostgreToolVectorRepository';
import { ToolVectorRepository } from '@Web/Tool/Domain/tool.vector.repository';
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserWebSchema,
            ToolWebSchema,
            UserWebRepository
          ]),
        CqrsModule,
        EmbeddingModule
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
