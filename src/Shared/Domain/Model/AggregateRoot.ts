import { DomainEvent } from "./../Event/DomainEvent";

export abstract class AggregateRoot {
	private domainEvents: DomainEvent[] = [];

	id: any;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;

	pullDomainEvents(): DomainEvent[] {
		const domainEvents = this.domainEvents;
		this.domainEvents = [];

		return domainEvents;
	}

	record(event: DomainEvent): void {
		this.domainEvents.push(event);
	}

	public getDomainEvents() {
		return this.domainEvents;
	}
}