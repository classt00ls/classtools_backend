import { Body, Controller, Get, Post, Query, Session } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
// web application DTO
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { getDetailToolDto } from 'src/web/Application/Dto/Tool/getDetailTool.dto';
// web application Queries
import { CountToolsQuery } from 'src/web/Application/Query/Tool/CountToolsQuery';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { GetDetailToolQuery } from 'src/web/Application/Query/Tool/GetDetailToolQuery';
import { GetFilteredToolsQuery } from 'src/web/Application/Query/Tool/GetFilteredToolsQuery';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { RequestGetToolDto } from './request.get.tool.dto';
import { FilterDto } from 'src/web/Application/Dto/Tool/filterTools.dto';

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

    console.log("Alguien quiere las tools ... ")
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

  @Post('filter')
  @Serialize(getAllToolsDto)
  async getByFilter(
    @Body() requestGetToolDto: RequestGetToolDto
  ) {
    console.log("Alguien quiere las tools ... ");
    const data = await this.queryBus.execute(
        new GetFilteredToolsQuery(
          requestGetToolDto.params.page,
          requestGetToolDto.params.pageSize,
          requestGetToolDto.params.filters
        )
    );

    const count = await this.queryBus.execute(
      new CountToolsQuery(
        requestGetToolDto.params.filters
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
    @Session() session: any,
    @Query('id') id: string
  ) {

    const userId = session.user ?? '45464bf5-ce1a-473f-af53-8b265f93871a';
    const data = await this.queryBus.execute(
        new GetDetailToolQuery(
          id,
          userId
        )
    );

    console.log('return: ', data)
    return data;

  }

  @Get('')
  async getJson() {
    
  }
  
}
