import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EmbeddingRepository } from '@Shared/Embedding/Domain/EmbeddingRepository';
import { CreateEventCommand } from '@Events/Event/Application/Create/CreateEventCommand';

@Injectable()
export class EmbeddingDeleter {
  constructor(
    private readonly repository: EmbeddingRepository,
    private readonly commandBus: CommandBus
  ) {}

  async run(id: string): Promise<void> {
    const embedding = await this.repository.findById(id);

    if (!embedding) {
      throw new Error(`Embedding with id ${id} not found`);
    }

    embedding.delete();

    await this.repository.delete(id);
    
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