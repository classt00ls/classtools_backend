import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateTagCommand } from '@Backoffice/Application/Command/Tag/UpdateTagCommand';
import { UpdateTagRequest } from '@Backoffice/Application/Request/Tag/UpdateTagRequest';

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
