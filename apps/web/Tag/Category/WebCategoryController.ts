import { Body, Controller, Get, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

@Controller('web/category')
export class WebCategoryController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Get('')
  async getAll() {
    
  }
  
}
