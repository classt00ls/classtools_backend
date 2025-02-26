import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { ToggleFavoriteCommand } from "./ToggleFavoriteCommand";


@QueryHandler(ToggleFavoriteCommand)
@Injectable()
export class ToggleFavoriteCommandHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(command: ToggleFavoriteCommand) {

        return await this.toolRepository.export( );
        
    }
}