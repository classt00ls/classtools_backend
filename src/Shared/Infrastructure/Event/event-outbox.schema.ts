import { EntitySchema } from 'typeorm';

export interface EventOutbox {
    id: string;
    event_type: string;
    event_data: any;
    created_at: Date;
    processed_at?: Date;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error_message?: string;
    retries: number;
}

export const EventOutboxSchema = new EntitySchema<EventOutbox>({
    name: 'event_outbox',
    schema: 'classtools',
    columns: {
        id: {
            type: String,
            primary: true,
            generated: 'uuid'
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
            type: String,
            default: 'pending'
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