import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllToolsDto } from '@Web/Tool/Domain/getAllTools.dto';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('discover/dialogflow')
export class DialogFlowcontroller {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  @Serialize(getAllToolsDto)
  async getAll(
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {

    

  }


  @Get('')
  async getJson() {
    
  }
  
}
