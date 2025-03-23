export class InvalidEmbeddingMetadataError extends Error {
  constructor(message: string = 'Embedding metadata is invalid') {
    super(message);
    this.name = 'InvalidEmbeddingMetadataError';
  }
} 