import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
// web application DTO
import { FilterToolsDto } from 'src/web/Application/Dto/Tool/filterTools.dto';
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { getDetailToolDto } from 'src/web/Application/Dto/Tool/getDetailTool.dto';
// web application Queries
import { CountToolsQuery } from 'src/web/Application/Query/Tool/CountToolsQuery';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { GetDetailToolQuery } from 'src/web/Application/Query/Tool/GetDetailToolQuery';
import { GetFilteredToolsQuery } from 'src/web/Application/Query/Tool/GetFilteredToolsQuery';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('tool')
export class ToolController {
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

    const count = await this.queryBus.execute(
      new CountToolsQuery(  )
    );

    return {
      data,
      count
    }


  }

  @Post('filter')
  @Serialize(getAllToolsDto)
  async getByFilter(
    @Body() filterTools: FilterToolsDto
  ) {

    console.log(' ===========  params: ', filterTools);
    
    const data = await this.queryBus.execute(
        new GetFilteredToolsQuery(
          filterTools.params.page,
          filterTools.params.pageSize,
          filterTools.params.filters.selectedCategories,
          filterTools.params.filters.stars
        )
    );

    const count = await this.queryBus.execute(
      new CountToolsQuery(
        filterTools.params.filters.selectedCategories,
        filterTools.params.filters.stars
      )
    );

    return {
      data,
      count
    }

  }


  @Get('detail')
  @Serialize(getDetailToolDto)
  async getTool(
    @Query('id') id?: string
  ) {

    const data = await this.queryBus.execute(
        new GetDetailToolQuery(id)
    );

    return data;

  }

  @Get('')
  async getJson() {
    
  }
  
}
