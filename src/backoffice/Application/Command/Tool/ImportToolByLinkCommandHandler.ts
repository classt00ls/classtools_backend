import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportToolByLinkCommand } from "./ImportToolByLinkCommand";
import { ImportToolInterface } from "src/backoffice/Domain/Tool/ImportToolInterface";


@CommandHandler(ImportToolByLinkCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolByLinkCommand>{
    constructor(
        @Inject('ImportToolInterface') private readonly importTool: ImportToolInterface
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