import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('backoffice/tool')
export class BackofficeToolController {
  constructor(
    private readonly queryBus: QueryBus
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


  @Get('')
  async getJson() {
    
  }
  
}
