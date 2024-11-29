export class BaseModel {

  
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;

  private domainEvents = [];

  public pullDomainEvents(): any
	{
		let domainEvents = this.domainEvents;
		this.domainEvents = [];

		return domainEvents;
	}

	protected record(domainEvent): void
	{
		this.domainEvents.push(domainEvent);
	}

	public getDomainEvents() {
		return this.domainEvents;
	}

}
