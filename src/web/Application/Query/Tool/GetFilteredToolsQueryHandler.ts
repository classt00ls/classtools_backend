import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { GenericFilter } from "src/Shared/Application/Filter/Tool/GenericFilter";
import { GetFilteredToolsQuery } from "./GetFilteredToolsQuery";


@QueryHandler(GetFilteredToolsQuery)
@Injectable()
export class GetFilteredToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetFilteredToolsQuery) {

        console.log('La query: ', query)
        return await this.toolRepository.getAll(
            new GenericFilter(
                query.page,
                query.pageSize,
                null,
                query.tags,
                query.stars
            )
        );
        
    }
}