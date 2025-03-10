import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEventCommand } from './CreateEventCommand';
import { EventCreator } from '../../Domain/EventCreator';
import { Injectable } from '@nestjs/common';

@Injectable()
@CommandHandler(CreateEventCommand)
export class CreateEventCommandHandler implements ICommandHandler<CreateEventCommand> {
    constructor(
        private creator: EventCreator
    ) {}

    async execute(command: CreateEventCommand): Promise<void> {
        await this.creator.create(
            command.event_type,
            command.event_data,
            command.aggregate_id
        );
    }
} 