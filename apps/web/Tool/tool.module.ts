import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from '@Web/Tool/Infrastructure/Persistence/Mysql/tool.typeorm.repository';
import { ToolController } from './tool.controller';
import { GetAllToolsQueryHandler } from 'src/web/Application/Query/Tool/GetAllToolsQueryHandler';
import { CountToolsQueryHandler } from 'src/web/Application/Query/Tool/CountToolsQueryHandler';
import { GetDetailToolQueryHandler } from 'src/web/Application/Query/Tool/GetDetailToolQueryHandler';

import { UserWebRepository } from                                   '@Web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from                            '@Web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from          '@Web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';

import { UserWebExtractor } from                                    '@Web/Domain/Service/UserWeb/UserWebExtractor';
import { UserWebExtractorFromFirebaseOrJwt } from                   '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebaseOrJwt';
import { UserWebExtractorFromFirebase } from                        '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromFirebase';
import { UserWebExtractorFromJwt } from                             '@Web/Infrastructure/Service/UserWeb/UserWebExtractorFromJwt';
import { ToolWebSchema } from                                       '@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema';
import { UserToolSuggestionsSearcher } from '@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from '@Web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from '@Web/Infrastructure/Repository/UserToolSuggestions/OllamaLangchainUserToolSuggestionsRepository';

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
        GetDetailToolQueryHandler,
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
