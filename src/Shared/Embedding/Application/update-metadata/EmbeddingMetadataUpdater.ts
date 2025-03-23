import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';
import { CreateEventCommand } from '@Events/Event/Application/Create/CreateEventCommand';

type EmbeddingMetadataUpdaterRequest = {
  id: string;
  metadata: Record<string, any>;
};

@Injectable()
export class EmbeddingMetadataUpdater {
  constructor(
    private readonly repository: EmbeddingRepository,
    private readonly commandBus: CommandBus
  ) {}

  async run(request: EmbeddingMetadataUpdaterRequest): Promise<void> {
    const embedding = await this.repository.findById(request.id);

    if (!embedding) {
      throw new Error(`Embedding with id ${request.id} not found`);
    }

    embedding.updateMetadata(request.metadata);

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