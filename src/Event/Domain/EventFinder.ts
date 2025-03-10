import { Injectable } from '@nestjs/common';
import { EventRepository } from './event.repository';
import { Event } from './Event';

@Injectable()
export class EventFinder {
    constructor(
        private repository: EventRepository
    ) {}

    async find(event_type: string): Promise<Event[]> {
        return this.repository.find(event_type);
    }
} 