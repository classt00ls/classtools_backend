export class ConsumeEventCommand {
    constructor(
        public readonly type: string,
        public readonly limit: number = 10
    ) {}
} 