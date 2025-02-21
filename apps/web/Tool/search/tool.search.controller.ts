import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';

import { GetFilteredToolsQuery } from '@Web/Tool/Application/search/GetFilteredToolsQuery';
import { ToolSearchRequest } from './tool.search.request';
import { ToolsSearchResponse } from './tool.search.response';
import { CountToolsQuery } from '@Web/Application/Query/Tool/CountToolsQuery';

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
    @Query() searchRequest: ToolSearchRequest
  ) {
    
    const data = await this.queryBus.execute(
        new GetFilteredToolsQuery(
          searchRequest.page,
          searchRequest.pageSize,
          searchRequest.filters
        )
    );

    const total = await this.queryBus.execute(
      new CountToolsQuery(
        searchRequest.filters
      )
    );
    
    const count = !searchRequest.filters.prompt ? total : 0;

    return {
      data,
      count
    }

  }
  
}
