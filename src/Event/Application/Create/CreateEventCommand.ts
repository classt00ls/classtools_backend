export class CreateEventCommand {
    constructor(
        public readonly event_type: string,
        public readonly event_data: any,
        public readonly aggregate_id: string
    ) {}
} 