import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
// web application DTO
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { getDetailToolDto } from 'src/web/Application/Dto/Tool/getDetailTool.dto';
// web application Queries
import { CountToolsQuery } from 'src/web/Application/Query/Tool/CountToolsQuery';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { GetDetailToolQuery } from 'src/web/Application/Query/Tool/GetDetailToolQuery';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { FilterDto } from 'src/web/Application/Dto/Tool/filterTools.dto';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';

@Controller('tool')
export class ToolController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}


  @Get('')
  @UseGuards(PublicGuard)
  @Serialize(getAllToolsDto)
  async getAll(
    @Request() req,
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {
    const data = await this.queryBus.execute(
        new GetAllToolsQuery(
          page,
          pageSize
        )
    );

    const count = await this.queryBus.execute(
      new CountToolsQuery( new FilterDto() )
    );

    return {
      data,
      count
    }
  }


  @Get('detail')
  @UseGuards(PublicGuard)
  @Serialize(getDetailToolDto)
  async getTool(
    @Request() request,
    @Query('id') id: string
  ) {

    const userId = request.userId;
    console.log('userId: ', userId);

    const data = await this.queryBus.execute(
        new GetDetailToolQuery(
          id,
          userId
        )
    );

    return data;
  }

  @Get('')
  async getJson() {
    
  }
  
}
