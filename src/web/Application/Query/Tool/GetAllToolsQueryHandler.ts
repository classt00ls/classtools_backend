import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";
import { GetAllToolsQuery } from "src/web/Application/Query/Tool/GetAllToolsQuery";
import { ToolFilter } from "@Web/Tool/Domain/tool.filter";


@QueryHandler(GetAllToolsQuery)
@Injectable()
export class GetAllToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetAllToolsQuery) {

        return await this.toolRepository.getAll(
            ToolFilter.fromPagination(
                query.page,
                query.pageSize
            )
        );
        
    }
}