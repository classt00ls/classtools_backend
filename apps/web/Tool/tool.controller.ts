import { Body, Controller, Get, Post, Query, Request, Session, UseGuards } from '@nestjs/common';
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

    console.log("Alguien quiere las tools '''...''' ", req)
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

  @UseGuards(PublicGuard)
  @Post('filter')
  @Serialize(getAllToolsDto)
  async getByFilter(
    @Request() req,
    @Body() requestGetToolDto: RequestGetToolDto
  ) {
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
