export class ToolAssignedEvent {
    constructor(
        public readonly tagId: string,
        public readonly toolId: string,
        public readonly tagName: string
    ) {}

    static eventName(): string {
        return 'backoffice.tag.tool.assigned';
    }
} 