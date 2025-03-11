import { Event } from './Event';

export interface EventProcess {
    processEvent(event: Event): Promise<void>;
} 