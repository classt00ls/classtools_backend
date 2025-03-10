import { Inject, Injectable } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { Event } from './Event';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EventCreator {
    constructor(
        @Inject('EventRepository') private repository: EventRepository
    ) {}

    async create(event_type: string, event_data: any, aggregate_id: string): Promise<void> {
        const event = Event.create(
            uuidv4(),
            event_type,
            event_data,
            aggregate_id
        );

        await this.repository.create(event);
    }
} 