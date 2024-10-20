import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
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
                query.tags,
                query.stars,
                query.page,
                query.pageSize
            )
        );
        
    }
}