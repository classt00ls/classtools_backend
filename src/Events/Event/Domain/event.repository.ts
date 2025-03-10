import { Event } from './Event';

export interface EventRepository {
    create(event: Event): Promise<void>;
    find(event_type: string): Promise<Event[]>;
} 