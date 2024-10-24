import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { GetFilteredToolsQuery } from "./GetFilteredToolsQuery";
import { ToolGenericFilter } from "src/Shared/Application/Filter/Tool/ToolGenericFilter";


@QueryHandler(GetFilteredToolsQuery)
@Injectable()
export class GetFilteredToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}
    
    async execute(query: GetFilteredToolsQuery) {

        return await this.toolRepository.getAll(
            new ToolGenericFilter(
                query.filter.selectedCategories,
                query.filter.stars,
                query.filter.title,
                query.page,
                query.pageSize
            )
        );
        
    }
}