import { Module } from                                      '@nestjs/common';
import { CqrsModule } from                                  '@nestjs/cqrs';
import { TypeOrmModule } from                               '@nestjs/typeorm';
import { ToolSchema } from                                  'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from                              'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from                       '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';

import { GetDetailToolQueryHandler } from                           '@Web/Application/Query/Tool/GetDetailToolQueryHandler';
import { UserWebRepository } from                                   '@Web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from                            '@Web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from          '@Web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';
import { UserWebExtractor } from                                    '@Web/Domain/Service/UserWeb/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from                   '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from                        '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from                             '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromJwt';
import { ToolWebSchema } from                                       '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';

import { GetFilteredToolsQueryHandler } from                        '@Web/Tool/Application/search/GetFilteredToolsQueryHandler';

import { ToolSearchController } from                                './tool.search.controller';
import { ToolVectorSearcher } from '@Web/Tool/Application/search/ToolVectorSearcher';
import { ToolVectorRepository } from '@Web/Tool/Domain/tool.vector.repository';
import { PostgreToolVectorRepository } from '@Web/Tool/Infrastructure/Persistence/Postgre/PostgreToolVectorRepository';
import { ToolSearcher } from '@Web/Tool/Application/search/ToolSearcher';
import { UserToolSuggestionsSearcher } from '@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from '@Web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolWebSchema,
            ToolSchema
          ]),
        CqrsModule
    ],
    controllers: [
        ToolSearchController
    ],
    providers: [
        ToolVectorSearcher,
        GetDetailToolQueryHandler,
        ToolSearcher,
        GetFilteredToolsQueryHandler,
        UserToolSuggestionsSearcher,
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
            provide: ToolVectorRepository,
            useClass: PostgreToolVectorRepository,
        },
        {
            provide: UserWebExtractor,
            useClass: UserWebExtractorFromFirebaseOrJwt,
        },
        {
            provide: UserToolSuggestionsRepository,
            useClass: OllamaLangchainUserToolSuggestionsRepository
        },
    ],
 })
export class ToolSearchModule {}
