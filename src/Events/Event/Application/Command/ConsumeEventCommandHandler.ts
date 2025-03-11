import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConsumeEventCommand } from './ConsumeEventCommand';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventRepository } from '@Events/Event/Domain/event.repository';
import { EventProcess } from '@Events/Event/Domain/EventProcess';

@Injectable()
@CommandHandler(ConsumeEventCommand)
export class ConsumeEventCommandHandler implements ICommandHandler<ConsumeEventCommand> {
    private readonly logger = new Logger(ConsumeEventCommandHandler.name);

    constructor(
        @Inject('EventRepository') private eventRepository: EventRepository,
        @Inject('EventProcess') private processor: EventProcess
    ) {}

    async execute(command: ConsumeEventCommand): Promise<void> {

        const events = await this.eventRepository.find(command.type, command.limit);

        for (let event of events) {

            this.logger.log(`Consumiendo evento: ${event.event_type}`);

            await this.processor.processEvent(event);

            event.markAsCompleted();

            await this.eventRepository.save(event);
        }   

    }
} 