import { AggregateRoot } from '@Shared/Domain/Model/AggregateRoot';
import { EmbeddingCreated } from '@Shared/Embedding/Domain/EmbeddingCreated';
import { EmbeddingUpdated } from '@Shared/Embedding/Domain/EmbeddingUpdated';
import { EmbeddingMetadataModified } from '@Shared/Embedding/Domain/EmbeddingMetadataModified';
import { EmbeddingDeleted } from '@Shared/Embedding/Domain/EmbeddingDeleted';
import { EmptyEmbeddingContentError } from '@Shared/Embedding/Domain/EmptyEmbeddingContentError';
import { InvalidEmbeddingMetadataError } from '@Shared/Embedding/Domain/InvalidEmbeddingMetadataError';
import { NonProcessedContentError } from '@Shared/Embedding/Domain/NonProcessedContentError';

export type EmbeddingPrimitives = {
  id: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export class Embedding extends AggregateRoot {
  readonly id: string;
  private _content: string;
  private _metadata: Record<string, any>;
  readonly createdAt: Date;

  private constructor(
    id: string,
    content: string,
    metadata: Record<string, any>,
    createdAt: Date,
    updatedAt: Date
  ) {
    super();
    this.id = id;
    this._content = content;
    this._metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Embedding {
    Embedding.validateContent(content);
    Embedding.validateMetadata(metadata);
    
    const now = new Date();
    const normalizedContent = Embedding.preprocessContent(content);
    
    const embedding = new Embedding(
      id,
      normalizedContent,
      metadata,
      now,
      now
    );
    
    embedding.record(new EmbeddingCreated({
      id, 
      contentLength: normalizedContent.length, 
      metadataKeys: Object.keys(metadata)
    }));
    
    return embedding;
  }

  static fromPrimitives(primitives: EmbeddingPrimitives): Embedding {
    return new Embedding(
      primitives.id,
      primitives.content,
      primitives.metadata,
      primitives.createdAt,
      primitives.updatedAt
    );
  }

  get content(): string {
    return this._content;
  }

  get metadata(): Record<string, any> {
    return { ...this._metadata };
  }

  updateContent(newContent: string): void {
    Embedding.validateContent(newContent);
    const normalizedContent = Embedding.preprocessContent(newContent);
    
    this._content = normalizedContent;
    this.updatedAt = new Date();
    
    this.record(new EmbeddingUpdated({
      id: this.id, 
      contentLength: normalizedContent.length
    }));
  }

  updateMetadata(newMetadata: Record<string, any>): void {
    Embedding.validateMetadata(newMetadata);
    
    this._metadata = newMetadata;
    this.updatedAt = new Date();
    
    this.record(new EmbeddingMetadataModified({
      id: this.id,
      metadataKeys: Object.keys(newMetadata)
    }));
  }

  delete(): void {
    this.record(new EmbeddingDeleted({ id: this.id }));
  }

  toPrimitives(): EmbeddingPrimitives {
    return {
      id: this.id,
      content: this._content,
      metadata: this._metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  private static validateContent(content: string): void {
    if (!content || content.trim() === '') {
      throw new EmptyEmbeddingContentError();
    }
  }

  private static validateMetadata(metadata: Record<string, any>): void {
    try {
      // Verificar que los metadatos sean serializables a JSON
      JSON.stringify(metadata);
      
      // Verificar que no contengan contenido semántico importante
      // Esto es una simplificación, en realidad necesitaríamos reglas más complejas
      const metadataValues = Object.values(metadata).join(' ');
      if (metadataValues.length > 1000) {
        throw new InvalidEmbeddingMetadataError('Metadata contains too much text content');
      }
    } catch (error) {
      if (error instanceof InvalidEmbeddingMetadataError) {
        throw error;
      }
      throw new InvalidEmbeddingMetadataError('Metadata is not serializable to JSON');
    }
  }

  private static preprocessContent(content: string): string {
    try {
      // Normalizar espacios en blanco
      let processed = content.trim().replace(/\s+/g, ' ');
      
      // Normalizar Unicode
      processed = processed.normalize('NFC');
      
      return processed;
    } catch (error) {
      throw new NonProcessedContentError();
    }
  }
} 