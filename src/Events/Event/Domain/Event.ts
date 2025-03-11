export class Event {
    private constructor(
        public readonly id: string,
        public event_type: string,
        public event_data: any,
        public aggregate_id: string,
        public created_at: Date,
        public processed_at: Date | null,
        public status: 'pending' | 'processing' | 'completed' | 'failed',
        public error_message: string | null,
        public retries: number
    ) {}

    toPrimitives() {
        return {
            id: this.id,
            event_type: this.event_type,
            event_data: this.event_data,
            aggregate_id: this.aggregate_id,
            created_at: this.created_at,
            processed_at: this.processed_at,
            status: this.status,
            error_message: this.error_message,
            retries: this.retries
        };
    }

    static create(
        id: string,
        event_type: string,
        event_data: any,
        aggregate_id: string
    ): Event {
        return new Event(
            id,
            event_type,
            event_data,
            aggregate_id,
            new Date(),
            null,
            'pending',
            null,
            0
        );
    }

    static fromPrimitives(
        id: string,
        event_type: string,
        event_data: any,
        aggregate_id: string,
        created_at: Date,
        processed_at: Date | null,
        status: 'pending' | 'processing' | 'completed' | 'failed',
        error_message: string | null,
        retries: number
    ): Event {
        return new Event(
            id,
            event_type,
            event_data,
            aggregate_id,
            created_at,
            processed_at,
            status,
            error_message,
            retries
        );
    }

    markAsProcessing(): void {
        this.processed_at = null;
        this.status = 'processing';
        this.error_message = null;
    }

    markAsCompleted(): void {
        this.processed_at = new Date();
        this.status = 'completed';
        this.error_message = null;
    }

    markAsFailed(error: string): void {
        this.processed_at = new Date();
        this.status = 'failed';
        this.error_message = error;
        this.retries += 1;
    }
} 