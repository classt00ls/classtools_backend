import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateEmbeddingCommand } from './UpdateEmbeddingCommand';
import { EmbeddingUpdater } from './EmbeddingUpdater';

@Injectable()
@CommandHandler(UpdateEmbeddingCommand)
export class UpdateEmbeddingCommandHandler implements ICommandHandler<UpdateEmbeddingCommand> {
  constructor(private readonly updater: EmbeddingUpdater) {}

  async execute(command: UpdateEmbeddingCommand): Promise<void> {
    await this.updater.run({
      id: command.id,
      content: command.content
    });
  }
} 