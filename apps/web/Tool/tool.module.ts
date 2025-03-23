import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ToolController } from './tool.controller';
import { GetAllToolsQueryHandler } from 'src/web/Application/Query/Tool/GetAllToolsQueryHandler';
import { CountToolsQueryHandler } from 'src/web/Application/Query/Tool/CountToolsQueryHandler';
import { GetDetailToolQueryHandler } from 'src/web/Application/Query/Tool/GetDetailToolQueryHandler';
import { GetToolBySlugQueryHandler } from 'src/web/Application/Query/Tool/GetToolBySlugQueryHandler';
import { TypeormUserWebRepository } from '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/TypeormUserWebRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from '@Web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';
import { UserWebExtractor } from '@Web/UserWeb/Domain/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from '@Web/UserWeb/Infrastructure/UserWebExtractorFromJwt';
import { UserToolSuggestionsSearcher } from '@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from '@Web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';
import { ToggleFavoriteCommandHandler } from '@Web/UserWeb/Application/ToggleFavoriteCommandHandler';
import { ToogleFavorite } from '@Web/UserWeb/Domain/ToogleFavorite';
import { ToolRepositoryModule } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';
import { ToolCreatedListener } from 'src/web/Tool/Domain/ToolCreatedListener';

@Module({
    imports: [
        ToolRepositoryModule,
        CqrsModule,
        EmbeddingModule
    ],
    controllers: [
        ToolController
    ],
    providers: [
        CountToolsQueryHandler,
        GetAllToolsQueryHandler,
        GetToolBySlugQueryHandler,
        ToggleFavoriteCommandHandler,
        GetDetailToolQueryHandler,
        UserToolSuggestionsSearcher,
        ToogleFavorite,
        GenerateUserToolSuggestionsOnToolGetDetail,
        UserWebExtractorFromFirebase,
        UserWebExtractorFromJwt,
        ToolCreatedListener,
        {
            provide: UserWebRepository,
            useClass: TypeormUserWebRepository,
        },
        {
            provide: UserToolSuggestionsRepository,
            useClass: OllamaLangchainUserToolSuggestionsRepository
        },
        {
            provide: UserWebExtractor,
            useClass: UserWebExtractorFromFirebaseOrJwt,
        }
    ],
})
export class ToolModule {}
