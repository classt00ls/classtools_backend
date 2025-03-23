export class CreateEmbeddingCommand {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly metadata?: Record<string, any>
  ) {}
} 