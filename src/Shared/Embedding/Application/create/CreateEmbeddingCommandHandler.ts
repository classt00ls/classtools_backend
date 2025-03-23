import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateEmbeddingCommand } from './CreateEmbeddingCommand';
import { EmbeddingCreator } from './EmbeddingCreator';

@Injectable()
@CommandHandler(CreateEmbeddingCommand)
export class CreateEmbeddingCommandHandler implements ICommandHandler<CreateEmbeddingCommand> {
  constructor(private readonly creator: EmbeddingCreator) {}

  async execute(command: CreateEmbeddingCommand): Promise<void> {
    await this.creator.run({
      id: command.id,
      content: command.content,
      metadata: command.metadata
    });
  }
} 