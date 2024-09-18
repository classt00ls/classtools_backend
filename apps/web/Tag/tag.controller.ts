import { Controller, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllTagsQuery } from 'src/Application/query/tools/GetAllTagsQuery';

@Controller('tag')
export class TagController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  async getTags() {
    return await this.queryBus.execute(
        new GetAllTagsQuery()
    );
  }
  
}
