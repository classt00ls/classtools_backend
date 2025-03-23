import { DomainEvent } from '@Shared/Domain/Event/DomainEvent';

type EmbeddingCreatedAttributes = {
  id: string;
  contentLength: number;
  metadataKeys: string[];
};

export class EmbeddingCreated extends DomainEvent {
  static readonly EVENT_NAME = 'embedding.created';
  readonly contentLength: number;
  readonly metadataKeys: string[];

  constructor(attributes: EmbeddingCreatedAttributes) {
    super(EmbeddingCreated.EVENT_NAME, attributes.id);
    this.contentLength = attributes.contentLength;
    this.metadataKeys = attributes.metadataKeys;
  }

  toPrimitives(): Record<string, any> {
    return {
      id: this.aggregateId,
      contentLength: this.contentLength,
      metadataKeys: this.metadataKeys
    };
  }
} 