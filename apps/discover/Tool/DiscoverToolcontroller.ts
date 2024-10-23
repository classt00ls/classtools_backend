import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('discover/tool')
export class DiscoverToolcontroller {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  @Serialize(getAllToolsDto)
  async getAll(
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {

    this.queryBus.execute(
      new GetAllToolsQuery(
        page,
        pageSize
      )
    )

  }


  @Get('')
  async getJson() {
    
  }
  
}
