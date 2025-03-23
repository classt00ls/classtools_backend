import { Embedding } from './Embedding';

export interface EmbeddingRepository {
  save(embedding: Embedding): Promise<void>;
  saveMany(embeddings: Embedding[]): Promise<void>;
  findById(id: string): Promise<Embedding | null>;
  search(query: string, limit?: number, metadataFilter?: Record<string, any>): Promise<Embedding[]>;
  searchSimilar(id: string, limit?: number): Promise<Embedding[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
} 