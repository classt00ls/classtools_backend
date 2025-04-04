import { EntitySchema } from 'typeorm';
import { Event } from '../../../Domain/Event';

export const EventSchema = new EntitySchema<Event>({
    name: 'event',
    columns: {
        id: {
            type: String,
            primary: true
        },
        event_type: {
            type: String
        },
        event_data: {
            type: 'jsonb'
        },
        aggregate_id: {
            type: String
        },
        created_at: {
            type: Date,
            createDate: true
        },
        processed_at: {
            type: Date,
            nullable: true
        },
        status: {
            type: String
        },
        error_message: {
            type: String,
            nullable: true
        },
        retries: {
            type: Number,
            default: 0
        }
    }
}); 