import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { GetAllToolsQuery } from "src/web/Application/Query/Tool/GetAllToolsQuery";
import { GenericFilter } from "src/Shared/Application/Filter/GenericFilter";
import { ToolGenericFilter } from "src/Shared/Application/Filter/Tool/ToolGenericFilter";


@QueryHandler(GetAllToolsQuery)
@Injectable()
export class GetAllToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetAllToolsQuery) {

        return await this.toolRepository.getAll(
            ToolGenericFilter.fromPagination(
                query.page,
                query.pageSize
            )
        );
        
    }
}