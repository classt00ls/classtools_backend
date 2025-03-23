import { DomainEvent } from '@Shared/Domain/Event/DomainEvent';

type EmbeddingMetadataModifiedAttributes = {
  id: string;
  metadataKeys: string[];
};

export class EmbeddingMetadataModified extends DomainEvent {
  static readonly EVENT_NAME = 'embedding.metadata.modified';
  readonly metadataKeys: string[];

  constructor(attributes: EmbeddingMetadataModifiedAttributes) {
    super(EmbeddingMetadataModified.EVENT_NAME, attributes.id);
    this.metadataKeys = attributes.metadataKeys;
  }

  toPrimitives(): Record<string, any> {
    return {
      id: this.aggregateId,
      metadataKeys: this.metadataKeys
    };
  }
} 