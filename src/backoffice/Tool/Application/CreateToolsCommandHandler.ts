import { QueryHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { CreateToolsCommand } from "./CreateToolsCommand";

import { GetFuturpediaPageLinksInterface } from "@Backoffice/Tool/Domain/GetFuturpediaPageLinksInterface";


@QueryHandler(CreateToolsCommand)
@Injectable()
export class CreateToolsCommandHandler {
    constructor(
        @Inject('ImportToolInterface') private readonly creator: ToolCreator
    ) {}

    async execute(command: CreateToolsCommand) {

        
    }
}