import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, Inject } from '@nestjs/common';
import { GetEmbeddingResponseCommand } from './GetEmbeddingResponseCommand';
import { EmbeddingResponseService, EmbeddingResponse } from '../../Domain/EmbeddingResponseService';

@Injectable()
@CommandHandler(GetEmbeddingResponseCommand)
export class GetEmbeddingResponseCommandHandler implements ICommandHandler<GetEmbeddingResponseCommand> {
  constructor(
    @Inject('EmbeddingResponseService') 
    private readonly responseService: EmbeddingResponseService
  ) {}

  /**
   * Ejecuta el comando y devuelve directamente la respuesta generada
   * 
   * @param command El comando con la consulta y opciones
   * @returns La respuesta generada por el servicio
   */
  async execute(command: GetEmbeddingResponseCommand): Promise<EmbeddingResponse> {
    return this.responseService.respond(
      command.query,
      command.options
    );
  }
} 