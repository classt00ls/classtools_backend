import { DomainEvent } from '@Shared/Domain/Event/DomainEvent';

type EmbeddingDeletedAttributes = {
  id: string;
};

export class EmbeddingDeleted extends DomainEvent {
  static readonly EVENT_NAME = 'embedding.deleted';

  constructor(attributes: EmbeddingDeletedAttributes) {
    super(EmbeddingDeleted.EVENT_NAME, attributes.id);
  }

  toPrimitives(): Record<string, any> {
    return {
      id: this.aggregateId
    };
  }
} 