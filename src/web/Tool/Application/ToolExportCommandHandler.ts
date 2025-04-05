import { CommandHandler, QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolExportCommand } from "./ToolExportCommand";


@QueryHandler(ToolExportCommand)
@Injectable()
export class ToolExportCommandHandler {
    constructor(
        private toolRepository: ToolRepository
    ) {}

    async execute(command: ToolExportCommand) {

        return await this.toolRepository.export( );
        
    }
}