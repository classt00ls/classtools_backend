import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetAllToolsQuery } from 'src/Application/query/tools/GetAllToolsQuery';

@Controller('tool')
export class ToolController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  async getJson() {
    return await this.queryBus.execute(
        new GetAllToolsQuery()
    );
  }
  
}
