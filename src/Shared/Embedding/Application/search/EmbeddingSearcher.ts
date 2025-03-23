import { Inject, Injectable } from '@nestjs/common';
import { Embedding } from '../../Domain/Embedding';
import { EmbeddingRepository } from '../../Domain/EmbeddingRepository';

type EmbeddingSearchRequest = {
  query: string;
  limit?: number;
  metadataFilter?: Record<string, any>;
};

@Injectable()
export class EmbeddingSearcher {
  constructor(
    @Inject('EmbeddingRepository') private readonly repository: EmbeddingRepository
  ) {}

  async run(request: EmbeddingSearchRequest): Promise<Embedding[]> {
    return this.repository.search(
      request.query,
      request.limit,
      request.metadataFilter
    );
  }
} 