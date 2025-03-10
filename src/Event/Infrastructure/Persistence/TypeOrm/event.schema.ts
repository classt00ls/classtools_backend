import { EntitySchema } from 'typeorm';
import { Event } from '../../../Domain/Event';

export const EventSchema = new EntitySchema<Event>({
    name: 'event',
    schema: 'classtools',
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