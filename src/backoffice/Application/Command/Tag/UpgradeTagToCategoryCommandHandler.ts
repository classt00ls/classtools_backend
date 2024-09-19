import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportTool } from "src/backoffice/Infrastructure/Import/puppeter/Tool/ImportTool";
import { UpgradeTagToCategoryCommand } from "./UpgradeTagToCategoryCommand";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagUpgradedEvent } from "src/Shared/Domain/Event/Tag/TagUpgradedEvent";


@CommandHandler(UpgradeTagToCategoryCommand)
@Injectable()
export class UpgradeTagToCategoryCommandHandler implements ICommandHandler<UpgradeTagToCategoryCommand>{
    constructor(
        @Inject('ImportToolInterface') private readonly importTool: ImportTool,
        private eventEmitter: EventEmitter2
    ) {}

    async execute(command: UpgradeTagToCategoryCommand) {

        try {
            await this.importTool.execute(command.tagId);

            this.eventEmitter.emit(
                'backoffice.tag.upgraded',
                new TagUpgradedEvent(
                    command.tagId
                ),
              );
        } catch (error) {
            console.log('UpgradeTagToCategory error.')
            return;
        }

    }
}