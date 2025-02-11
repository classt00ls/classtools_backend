import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';

import { GetFilteredToolsQuery } from '@Web/Tool/Application/search/GetFilteredToolsQuery';
import { ToolSearchRequest } from './tool.search.request';
import { ToolsSearchResponse } from './tool.search.response';

@Controller('tool/search')
export class ToolSearchController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}
  

  @UseGuards(PublicGuard)
  @UsePipes(new ValidationPipe({ transform: true })) // Activa validaciones y transforma los datos
  @Get('')
  @Serialize(ToolsSearchResponse)
  async getByFilter(
    @Query() searchQRquest: ToolSearchRequest
  ) {

    console.log('searchQRquest: ', searchQRquest.filters);
    
    const data = await this.queryBus.execute(
        new GetFilteredToolsQuery(
          searchQRquest.page,
          searchQRquest.pageSize,
          searchQRquest.filters
        )
    );

    // const count = await this.queryBus.execute(
    //   new CountToolsQuery(
    //     requestGetToolDto.params.filters
    //   )
    // );

    // return {
    //   data,
    //   count
    // }

  }
  
}
