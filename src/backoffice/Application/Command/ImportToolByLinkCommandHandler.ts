import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportToolByLinkCommand } from "./ImportToolByLinkCommand";
import { ImportTool } from "src/backoffice/Infrastructure/Import/puppeter/Tool/ImportTool";


@CommandHandler(ImportToolByLinkCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolByLinkCommand>{
    constructor(
        private readonly importTool: ImportTool
    ) {}

    async execute(command: ImportToolByLinkCommand) {

        try {
            await this.importTool.execute(command.link);
        } catch (error) {
            console.log('importTool error.')
            return;
        }

    }
}