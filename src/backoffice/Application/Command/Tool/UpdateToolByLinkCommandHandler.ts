import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateFuturpediaToolInterface } from "src/backoffice/Domain/Tool/Futurpedia/UpdateFuturpediaToolInterface";
import { UpdateToolByLinkCommand } from "./UpdateToolByLinkCommand";


@CommandHandler(UpdateToolByLinkCommand)
@Injectable()
export class UpdateToolByLinkCommandHandler implements ICommandHandler<UpdateToolByLinkCommand>{
    constructor(
        @Inject('UpdateFuturpediaToolInterface') private readonly updateTool: UpdateFuturpediaToolInterface
    ) {}

    async execute(command: UpdateToolByLinkCommand) {

        try {
            await this.updateTool.execute(command.link);
        } catch (error) {
            console.log(error)
            console.log('importTool error.', command.link)
            return;
        }

    }
}