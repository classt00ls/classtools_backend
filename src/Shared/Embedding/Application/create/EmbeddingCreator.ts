import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Embedding } from '@Shared/Embedding/Domain/Embedding';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';
import { CreateEventCommand } from '@Events/Event/Application/Create/CreateEventCommand';

type EmbeddingCreatorRequest = {
  id: string;
  content: string;
  metadata?: Record<string, any>;
};

@Injectable()
export class EmbeddingCreator {
  constructor(
    @Inject('EmbeddingRepository') private readonly repository: EmbeddingRepository,
    private readonly commandBus: CommandBus
  ) {}

  async run(request: EmbeddingCreatorRequest): Promise<void> {
    const embedding = Embedding.create(
      request.id,
      request.content,
      request.metadata || {}
    );

    await this.repository.save(embedding);
    
    // Obtenemos los eventos de dominio del agregado
    const events = embedding.pullDomainEvents();
    
    // Almacenamos cada evento utilizando CreateEventCommand
    await Promise.all(
      events.map(async (event) => {
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