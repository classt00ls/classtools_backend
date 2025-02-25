import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateToolByLinkCommand } from "./UpdateToolByLinkCommand";
import { UpdateToolInterface } from "src/backoffice/Tool/Domain/UpdateToolInterface";


@CommandHandler(UpdateToolByLinkCommand)
@Injectable()
export class UpdateToolByLinkCommandHandler implements ICommandHandler<UpdateToolByLinkCommand>{
    constructor(
        @Inject('UpdateToolInterface') private readonly updateTool: UpdateToolInterface
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