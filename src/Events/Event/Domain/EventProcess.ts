import { Event } from './Event';

export interface EventProcess {
    processEvent(eventType: string, eventData: any): Promise<void>;
} 