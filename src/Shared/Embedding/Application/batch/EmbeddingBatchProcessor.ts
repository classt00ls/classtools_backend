import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Embedding } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';
import { CreateEventCommand } from '@Events/Event/Application/Create/CreateEventCommand';

type EmbeddingCreationRequest = {
  id: string;
  content: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class EmbeddingBatchProcessor {
  constructor(
    @Inject('EmbeddingRepository') private readonly repository: EmbeddingRepository,
    private readonly commandBus: CommandBus
  ) {}

  async createBatch(requests: EmbeddingCreationRequest[]): Promise<void> {
    const embeddings = requests.map(request => 
      Embedding.create(request.id, request.content, request.metadata || {})
    );

    await this.repository.saveMany(embeddings);

    // Publicar eventos en batch
    const allEvents = embeddings.flatMap(embedding => embedding.pullDomainEvents());
    
    // Almacenamos cada evento utilizando CreateEventCommand
    await Promise.all(
      allEvents.map(async (event) => {
        await this.commandBus.execute(
          new CreateEventCommand(
            event.eventName,
            event.toPrimitives(),
            event.aggregateId
          )
        );
      })
    );
  }

  async deleteBatch(ids: string[]): Promise<void> {
    // Primero recuperamos todos los embeddings para poder emitir eventos
    const embeddings = await Promise.all(
      ids.map(id => this.repository.findById(id))
    );

    // Marcar como eliminados y recopilar eventos
    const validEmbeddings = embeddings.filter(embedding => embedding !== null) as Embedding[];
    validEmbeddings.forEach(embedding => embedding.delete());

    // Eliminar en batch
    await this.repository.deleteMany(ids);

    // Publicar eventos
    const allEvents = validEmbeddings.flatMap(embedding => embedding.pullDomainEvents());
    
    // Almacenamos cada evento utilizando CreateEventCommand
    await Promise.all(
      allEvents.map(async (event) => {
        await this.commandBus.execute(
          new CreateEventCommand(
            event.eventName,
            event.toPrimitives(),
            event.aggregateId
          )
        );
      })
    );
  }
} 