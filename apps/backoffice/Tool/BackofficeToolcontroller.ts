import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ToolSchema } from '@Shared/Infrastructure/Persistence/typeorm/tool.schema';
import { ToolExportCommand } from '@Web/Application/Command/Tool/ToolExportCommand';
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('backoffice/tool')
export class BackofficeToolController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('')
  @Serialize(getAllToolsDto)
  async getAll(
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {

    const data = await this.queryBus.execute(
      new GetAllToolsQuery(
        page,
        pageSize
      )
    );

    return {
      data
    };

  }

  @Get('generate')
  async generateJson() {

    await this.queryBus.execute(
      new ToolExportCommand(  )
    );
    
  }


  @Get('')
  async getJson() {
    
  }
  
}
