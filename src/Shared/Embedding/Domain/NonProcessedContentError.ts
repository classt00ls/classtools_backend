export class NonProcessedContentError extends Error {
  constructor() {
    super('Could not process embedding content');
    this.name = 'NonProcessedContentError';
  }
} 