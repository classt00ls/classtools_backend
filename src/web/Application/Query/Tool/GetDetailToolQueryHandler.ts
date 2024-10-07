import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { GetDetailToolQuery } from "./GetDetailToolQuery";


@QueryHandler(GetDetailToolQuery)
@Injectable()
export class GetDetailToolQueryHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(query: GetDetailToolQuery) {

        return await this.toolRepository.getOneByIdOrFail(query.id);
        
    }
}