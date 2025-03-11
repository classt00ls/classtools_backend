import { AggregateRoot } from '@nestjs/cqrs';

export class Event extends AggregateRoot {
    constructor(
        public readonly id: string,
        public readonly type: string,
        public readonly occurredOn: Date,
        public readonly attributes: Record<string, any>
    ) {
        super();
    }

    static create(
        id: string,
        type: string,
        occurredOn: Date,
        attributes: Record<string, any>
    ): Event {
        const event = new Event(id, type, occurredOn, attributes);
        
        // Aquí podríamos aplicar reglas de dominio o validaciones específicas
        
        return event;
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            occurredOn: this.occurredOn,
            attributes: this.attributes
        };
    }
} 