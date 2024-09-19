import { Controller, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllTagsQuery } from 'src/web/Application/Query/Tag/GetAllTagsQuery';

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
