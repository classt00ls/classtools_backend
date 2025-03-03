import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { ToolController } from './tool.controller';
import { GetAllToolsQueryHandler } from 'src/web/Application/Query/Tool/GetAllToolsQueryHandler';
import { CountToolsQueryHandler } from 'src/web/Application/Query/Tool/CountToolsQueryHandler';
import { GetDetailToolQueryHandler } from 'src/web/Application/Query/Tool/GetDetailToolQueryHandler';

import { TypeormUserWebRepository } from                            '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/TypeormUserWebRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from          '@Web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';

import { UserWebExtractor } from                                    '@Web/UserWeb/Domain/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from                   '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from                        '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from                             '@Web/UserWeb/Infrastructure/UserWebExtractorFromJwt';
import { ToolWebSchema } from                                       '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';
import { UserToolSuggestionsSearcher } from '@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from '@Web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';
import { ToggleFavoriteCommandHandler } from '@Web/UserWeb/Application/ToggleFavoriteCommandHandler';
import { ToogleFavorite } from '@Web/UserWeb/Domain/ToogleFavorite';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolWebSchema,
            ToolSchema
          ]),
        CqrsModule
    ],
    controllers: [
        ToolController
    ],
    providers: [
        CountToolsQueryHandler,
        GetAllToolsQueryHandler,
        ToggleFavoriteCommandHandler,
        GetDetailToolQueryHandler,
        UserToolSuggestionsSearcher,
        ToogleFavorite,
        GenerateUserToolSuggestionsOnToolGetDetail,
        UserWebExtractorFromFirebase,
        UserWebExtractorFromJwt,
        {
            provide: ToolRepository,
            useClass: ToolTypeormRepository,
        },
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
