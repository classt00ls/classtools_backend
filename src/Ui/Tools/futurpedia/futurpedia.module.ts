import { Module } from '@nestjs/common';
import { FuturpediaController } from './futurpedia.controller';
import { FuturpediaScrappingService } from 'src/Infrastructure/Service/scrapping/futurpediaScrapping.service';
import { GetAllFuturpediaHomeToolsQueryHandler } from 'src/Application/query/tools/GetAllFuturpediaHomeToolsQueryHandler';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';


@Module({
    imports: [
        CqrsModule
    ],
    controllers: [
        FuturpediaController
    ],
    providers: [
        GetAllFuturpediaHomeToolsQueryHandler
    ]
 })
export class FuturpediaModule {}
