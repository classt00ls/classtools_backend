import { Module } from                                      '@nestjs/common';
import { CqrsModule } from                                  '@nestjs/cqrs';
import { TypeOrmModule } from                               '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ToolSchema } from                                  '@backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.schema';
import { ToolRepository } from                              '@backoffice/Tool/Domain/tool.repository';
import { ToolTypeormRepository } from                       'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository';
import { TOOL_TABLE_SUFFIX } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';

import { GetDetailToolQueryHandler } from                           '@Web/Application/Query/Tool/GetDetailToolQueryHandler';
import { CountToolsByLangQueryHandler } from                       '@Web/Application/Query/Tool/CountToolsByLangQueryHandler';

import { TypeormUserWebRepository } from                            '@Web/UserWeb/Infrastructure/Persistence/TypeOrm/TypeormUserWebRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from          '@Web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';
import { UserWebExtractor } from                                    '@Web/UserWeb/Domain/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from                   '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from                        '@Web/UserWeb/Infrastructure/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from                             '@Web/UserWeb/Infrastructure/UserWebExtractorFromJwt';
import { ToolWebSchema } from                                       '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';

import { GetFilteredToolsQueryHandler } from                        '@Web/Tool/Application/search/GetFilteredToolsQueryHandler';
import { GetFilteredToolsByLangQueryHandler } from                  '@Web/Tool/Application/search/GetFilteredToolsByLangQueryHandler';

import { ToolSearchController } from                                './tool.search.controller';
import { ToolVectorSearcher } from '@Web/Tool/Application/search/ToolVectorSearcher';
import { ToolVectorRepository } from '@Web/Tool/Domain/tool.vector.repository';
import { PostgreToolVectorRepository } from '@Web/Tool/Infrastructure/Persistence/Postgre/PostgreToolVectorRepository';
import { ToolSearcher } from '@Web/Tool/Application/search/ToolSearcher';
import { UserToolSuggestionsSearcher } from '@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from '@Web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository';
import { ScrapeFromUrls } from '@Web/Tool/Infrastructure/ScrapeFromUrls';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolWebSchema,
            ToolSchema
          ]),
        CqrsModule,
        EmbeddingModule
    ],
    controllers: [
        ToolSearchController
    ],
    providers: [
        ToolVectorSearcher,
        GetDetailToolQueryHandler,
        ToolSearcher,
        GetFilteredToolsQueryHandler,
        GetFilteredToolsByLangQueryHandler,
        CountToolsByLangQueryHandler,
        ScrapeFromUrls,
        UserToolSuggestionsSearcher,
        GenerateUserToolSuggestionsOnToolGetDetail,
        UserWebExtractorFromFirebase,
        UserWebExtractorFromJwt,
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
