export class Event {
    constructor(
        readonly id: string,
        readonly event_type: string,
        readonly event_data: any,
        readonly created_at: Date,
        readonly processed_at: Date | null,
        readonly status: 'pending' | 'processing' | 'completed' | 'failed',
        readonly error_message: string | null,
        readonly retries: number
    ) {}

    static create(
        id: string,
        event_type: string,
        event_data: any
    ): Event {
        return new Event(
            id,
            event_type,
            event_data,
            new Date(),
            null,
            'pending',
            null,
            0
        );
    }

    markAsProcessing(): Event {
        return new Event(
            this.id,
            this.event_type,
            this.event_data,
            this.created_at,
            null,
            'processing',
            null,
            this.retries
        );
    }

    markAsCompleted(): Event {
        return new Event(
            this.id,
            this.event_type,
            this.event_data,
            this.created_at,
            new Date(),
            'completed',
            null,
            this.retries
        );
    }

    markAsFailed(error: string): Event {
        return new Event(
            this.id,
            this.event_type,
            this.event_data,
            this.created_at,
            new Date(),
            'failed',
            error,
            this.retries + 1
        );
    }
} 