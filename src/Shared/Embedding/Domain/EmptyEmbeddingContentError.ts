export class EmptyEmbeddingContentError extends Error {
  constructor() {
    super('Embedding content cannot be empty');
    this.name = 'EmptyEmbeddingContentError';
  }
} 