import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToolSchema } from 'src/Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';
import { ToolTypeormRepository } from 'src/Infrastructure/Repository/typeorm/tool.typeorm.repository';
import { ToolController } from './tool.controller';
import { GetAllToolsQueryHandler } from 'src/web/Application/Query/Tool/GetAllToolsQueryHandler';
import { CountToolsQueryHandler } from 'src/web/Application/Query/Tool/CountToolsQueryHandler';
import { GetDetailToolQueryHandler } from 'src/web/Application/Query/Tool/GetDetailToolQueryHandler';
import { GetFilteredToolsQueryHandler } from 'src/web/Application/Query/Tool/GetFilteredToolsQueryHandler';
import { UserWebRepository } from 'src/web/Domain/Repository/UserWeb/UserWebRepository';
import { TypeormUserWebRepository } from 'src/web/Infrastructure/Repository/UserWeb/TypeormUserWebRepository';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserToolSuggestionsRepository } from 'src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository';
import { OllamaLangchainUserToolSuggestionsRepository } from 'src/web/Infrastructure/Repository/UserToolSuggestions/OllamaLangchainUserToolSuggestionsRepository';
import { GenerateUserToolSuggestionsOnToolGetDetail } from 'src/web/Application/Listener/UserToolSuggestions/GenerateUserToolSuggestionsOnToolGetDetail';
import { GetSuggestedToolsQueryHandler } from 'src/web/Application/Query/Tool/GetSuggestedToolsQueryHandler';
import { GetUserToolSuggestionsFromString } from 'src/web/Domain/Service/UserToolSuggestions/GetUserToolSuggestionsFromString';


@Module({
    imports: [
        TypeOrmModule.forFeature([
            ToolSchema
          ]),
        CqrsModule
    ],
    controllers: [
        ToolController
    ],
    providers: [
        GetSuggestedToolsQueryHandler,
        GetUserToolSuggestionsFromString,
        UserToolSuggestionsSearcher,
        CountToolsQueryHandler,
        GetAllToolsQueryHandler,
        GetDetailToolQueryHandler,
        GetFilteredToolsQueryHandler,
        GenerateUserToolSuggestionsOnToolGetDetail,
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
            useClass: OllamaLangchainUserToolSuggestionsRepository,
        }
        
    ]
 })
export class ToolModule {}
