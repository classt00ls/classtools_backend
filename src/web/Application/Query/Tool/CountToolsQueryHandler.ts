import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { CountToolsQuery } from "src/web/Application/Query/Tool/CountToolsQuery";


@QueryHandler(CountToolsQuery)
@Injectable()
export class CountToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: CountToolsQuery) {

        return await this.toolRepository.count( 
            query.filter.selectedCategories,
            query.filter.stars,
            query.filter.title
        );
        
    }
}