import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpgradeTagToCategoryCommand } from "./UpgradeTagToCategoryCommand";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagUpgradedEvent } from "src/Shared/Domain/Event/Tag/TagUpgradedEvent";
import { TagRepository } from "src/Shared/Domain/Repository/tag.repository";


@CommandHandler(UpgradeTagToCategoryCommand)
@Injectable()
export class UpgradeTagToCategoryCommandHandler implements ICommandHandler<UpgradeTagToCategoryCommand>{
    constructor(
        private tagRepository: TagRepository,
        private eventEmitter: EventEmitter2
    ) {}

    async execute(command: UpgradeTagToCategoryCommand) {

        try {
            const tag = await this.tagRepository.getOneByIdOrFail(command.tagId);
            console.log('UpgradeTagToCategory error.', tag);
            tag.upgrade();

            await this.tagRepository.save(tag);

            this.eventEmitter.emit(
                'backoffice.tag.upgraded',
                new TagUpgradedEvent(
                    command.tagId
                ),
              );
        } catch (error) {
            console.log('UpgradeTagToCategory error.');
        }

    }
}