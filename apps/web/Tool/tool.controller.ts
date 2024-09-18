import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ToolDashboardDto } from 'src/web/Application/Dto/Tool/tool.dashboard.dto';
import { GetAllToolsQuery } from 'src/web/Domain/Query/Tool/GetAllToolsQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('tool')
export class ToolController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  @Get('')
  @Serialize(ToolDashboardDto)
  async getAll(
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {
    return await this.queryBus.execute(
        new GetAllToolsQuery(
          page,
          pageSize
        )
    );
  }

  @Get('')
  async getJson() {
    
  }
  
}
