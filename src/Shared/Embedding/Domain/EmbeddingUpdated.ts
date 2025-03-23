import { DomainEvent } from '@Shared/Domain/Event/DomainEvent';

type EmbeddingUpdatedAttributes = {
  id: string;
  contentLength: number;
};

export class EmbeddingUpdated extends DomainEvent {
  static readonly EVENT_NAME = 'embedding.updated';
  readonly contentLength: number;

  constructor(attributes: EmbeddingUpdatedAttributes) {
    super(EmbeddingUpdated.EVENT_NAME, attributes.id);
    this.contentLength = attributes.contentLength;
  }

  toPrimitives(): Record<string, any> {
    return {
      id: this.aggregateId,
      contentLength: this.contentLength
    };
  }
} 