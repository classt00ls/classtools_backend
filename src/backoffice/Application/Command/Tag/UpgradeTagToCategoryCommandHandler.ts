import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpgradeTagToCategoryCommand } from "./UpgradeTagToCategoryCommand";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagUpgradedEvent } from "@Backoffice/Tag/Domain/TagUpgradedEvent";
import { TagRepository } from "@Backoffice/Tag/Domain/tag.repository";


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