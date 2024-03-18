import { Controller, Get } from '@nestjs/common';
import { QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetAllFuturpediaHomeToolsQuery } from 'src/Application/query/tools/GetAllFuturpediaHomeToolsQuery';

@Controller('futurpedia')
export class FuturpediaController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('webTools')
  async getWebTools() {

    const tools = await this.queryBus.execute(
      new GetAllFuturpediaHomeToolsQuery()
    );
    return tools;

  }
}
