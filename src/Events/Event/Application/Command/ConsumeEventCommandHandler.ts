import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConsumeEventCommand } from './ConsumeEventCommand';
import { Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '@Events/Event/Domain/event.repository';

@Injectable()
@CommandHandler(ConsumeEventCommand)
export class ConsumeEventCommandHandler implements ICommandHandler<ConsumeEventCommand> {
    private readonly logger = new Logger(ConsumeEventCommandHandler.name);

    constructor(
        private readonly eventRepository: EventRepository
    ) {}

    async execute(command: ConsumeEventCommand): Promise<void> {

        const events = await this.eventRepository.find  (command.type);

        for (const event of events) {
            this.logger.log(`Consumiendo evento: ${event.event_type}`);
        }

    }
} 