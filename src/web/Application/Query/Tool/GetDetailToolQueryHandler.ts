import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { GetDetailToolQuery } from "./GetDetailToolQuery";


@QueryHandler(GetDetailToolQuery)
@Injectable()
export class GetDetailToolQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetDetailToolQuery) {

        const tool = await this.toolRepository.getOneByIdOrFail(query.id);
        tool.url = tool.url.split('?')[0];
        return tool;
        
    }
}