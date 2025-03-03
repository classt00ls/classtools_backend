import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportToolInterface } from "src/backoffice/Tool/Domain/ImportToolInterface";
import { ImportToolCommand } from "./ImportToolCommand";


@CommandHandler(ImportToolCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolCommand>{
    constructor(
        @Inject('ImportToolInterface') private readonly importTool: ImportToolInterface
    ) {}

    async execute(command: ImportToolCommand) {

        await this.importTool.import(command.link);

    }
}