import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagUpgradedEvent } from "src/Shared/Domain/Event/Tag/TagUpgradedEvent";
import { TagRepository } from "src/Shared/Domain/Repository/tag.repository";
import { UpdateTagCommand } from "./UpdateTagCommand";


@CommandHandler(UpdateTagCommand)
@Injectable()
export class UpdateTagCommandHandler implements ICommandHandler<UpdateTagCommand>{
    constructor(
        private tagRepository: TagRepository,
        private eventEmitter: EventEmitter2
    ) {}

    async execute(command: UpdateTagCommand) {

        try {
            const tag = await this.tagRepository.getOneByIdOrFail(command.tagId);

            tag.name = command.name;
            tag.excerpt = command.excerpt;
            tag.imageUrl = command.imageUrl;

            await this.tagRepository.update(tag);

            this.eventEmitter.emit(
                'backoffice.tag.updated',
                new TagUpgradedEvent(
                    command.tagId
                ),
              );
        } catch (error) {
            console.log('UpgradeTagToCategory error.');
        }

    }
}