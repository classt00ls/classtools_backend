import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { GetAllToolsQuery } from "./GetAllToolsQuery";
import { ToolRepository } from "src/Domain/Repository/tool.repository";


@QueryHandler(GetAllToolsQuery)
@Injectable()
export class GetAllToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(command: GetAllToolsQuery) {

        return await this.toolRepository.getAll();
        
    }
}