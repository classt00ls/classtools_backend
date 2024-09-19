import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('backoffice')
export class BackofficeToolController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('tool')
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
