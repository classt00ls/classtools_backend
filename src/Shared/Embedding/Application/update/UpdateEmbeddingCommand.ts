export class UpdateEmbeddingCommand {
  constructor(
    public readonly id: string,
    public readonly content: string
  ) {}
} 