import { DomainEventAttributes } from "src/Shared/Application/Event/ApplicationEvent";
import { DomainEvent } from "src/Shared/Domain/Event/DomainEvent";

export class UserToolSuggestionsGenerated extends DomainEvent{

    static eventName = 'web.usertoolsuggestions.generated';
  email: string;
  name: string;

  constructor(
    public readonly userId: string,
    public readonly suggestions: string
  ) {
    super(UserToolSuggestionsGenerated.eventName, userId);
  }

  public toPrimitives():DomainEventAttributes {
    return {
      'userId': this.userId,
      'suggestions': this.suggestions
    }
  }
  
}