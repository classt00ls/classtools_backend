export class TagCreatedEvent {
    constructor(
        public readonly id: string
    ) {}

    static eventName(): string {
        return 'backoffice.tag.created';
    }
} 