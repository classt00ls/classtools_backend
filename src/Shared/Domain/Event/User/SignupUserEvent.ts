import { DomainEventAttributes } from "src/Shared/Application/Event/ApplicationEvent";
import { DomainEvent } from "../DomainEvent";

export class SignupUserEvent extends DomainEvent{

  email: string;
  name: string;

  constructor(
    aggregateId: string,
    email: string,
    name: string
  ) {
    super('shared.user.signup', aggregateId);
    
    this.email = email;
    this.name = name;
  }

  public toPrimitives():DomainEventAttributes {
    return {
      'aggregateId': this.aggregateId,
      'email': this.email,
      'name': this.name
    }
  }
  
}