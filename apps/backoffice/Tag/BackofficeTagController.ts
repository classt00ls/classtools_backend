import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

@Controller('backoffice/tag')
export class BackofficeTagController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  async getAll(
  ) {

  }

  @Get('')
  async getJson() {
    
  }
  
}
