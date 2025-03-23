import { EmbeddingResponseOptions } from '../../Domain/EmbeddingResponseService';

export class GetEmbeddingResponseCommand {
  constructor(
    public readonly query: string,
    public readonly options?: EmbeddingResponseOptions
  ) {}
} 