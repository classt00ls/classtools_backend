import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { GetAllToolsQuery } from "src/web/Domain/Query/Tool/GetAllToolsQuery";
import { GenericFilter } from "src/Shared/Domain/GenericFilter";


@QueryHandler(GetAllToolsQuery)
@Injectable()
export class GetAllToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetAllToolsQuery) {

        const page = (query.page && query.pageSize) && query.page > 1 ? (Number(query.page) - 1)*Number(query.pageSize) : query.page;

        console.log("page: " + query.page + " pageSize: " + Number(query.pageSize) + " page: " + page);

        return await this.toolRepository.getAll(
            new GenericFilter(
                page,
                query.pageSize
            )
        );
        
    }
}