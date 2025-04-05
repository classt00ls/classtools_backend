// import { QueryHandler } from "@nestjs/cqrs";
// import { Inject, Injectable } from "@nestjs/common";
// import { CreateToolsCommand } from "./CreateToolsCommand";

// import { GetFuturpediaPageLinksInterface } from "@backoffice/Tool/Domain/GetFuturpediaPageLinksInterface";
// import { ToolCreator } from "../Domain/ToolCreator";


// @QueryHandler(CreateToolsCommand)
// @Injectable()
// export class CreateToolsCommandHandler {
//     constructor(
//         @Inject('ImportToolInterface') private readonly creator: ToolCreator
//     ) {}

//     async execute(command: CreateToolsCommand) {

//         this.creator.create(command.url);
        
//     }
// }