import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { GetFilteredToolsQuery } from "./GetFilteredToolsQuery";
import { ToolSearcher } from "./ToolSearcher";
import { ToolVectorSearcher } from "./ToolVectorSearcher";


@QueryHandler(GetFilteredToolsQuery)
@Injectable()
export class GetFilteredToolsQueryHandler {
    constructor(
        private toolSearcher: ToolSearcher,
        private toolVectorSearcher: ToolVectorSearcher
    ) {}
    
    async execute(query: GetFilteredToolsQuery) {

        if(query.filter.prompt) {

            return await this.toolVectorSearcher.search(query.filter.prompt);

        }

        return await this.toolSearcher.search(
                query.filter.selectedCategories,
                query.filter.stars,
                query.filter.title,
                query.page,
                query.pageSize,
                
        );
    }
}