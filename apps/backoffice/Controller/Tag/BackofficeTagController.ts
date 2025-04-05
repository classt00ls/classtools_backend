import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateTagCommand } from '@backoffice/Application/Command/Tag/UpdateTagCommand';
import { UpdateTagRequest } from '@backoffice/Application/Request/Tag/UpdateTagRequest';

@Controller('backoffice/tag')
export class BackofficeTagController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Get('')
  async getAll(
  ) {

  }

  @Put('')
  async updateTag(
    @Body() upgradeTagRequest?: UpdateTagRequest
  ) {
    await this.commandBus.execute(
      new UpdateTagCommand(
        upgradeTagRequest.id,
        upgradeTagRequest.excerpt,
        upgradeTagRequest.imageUrl,
        upgradeTagRequest.name
      )
    );
  }
  
}
