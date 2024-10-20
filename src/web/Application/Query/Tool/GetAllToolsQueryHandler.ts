import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { GetAllToolsQuery } from "src/web/Application/Query/Tool/GetAllToolsQuery";
import { GenericFilter } from "src/Shared/Application/Filter/GenericFilter";


@QueryHandler(GetAllToolsQuery)
@Injectable()
export class GetAllToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetAllToolsQuery) {

        return await this.toolRepository.getAll(
            new GenericFilter(
                query.page,
                query.pageSize
            )
        );
        
    }
}