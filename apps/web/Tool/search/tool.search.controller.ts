import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';

import { GetFilteredToolsQuery } from '@Web/Tool/Application/search/GetFilteredToolsQuery';
import { GetFilteredToolsByLangQuery } from '@Web/Tool/Application/search/GetFilteredToolsByLangQuery';
import { ToolSearchRequest } from './tool.search.request';
import { ToolsSearchResponse } from './tool.search.response';
import { CountToolsQuery } from '@Web/Application/Query/Tool/CountToolsQuery';
import { CountToolsByLangQuery } from '@Web/Application/Query/Tool/CountToolsByLangQuery';
import { ScrapeFromUrls } from '@Web/Tool/Infrastructure/ScrapeFromUrls';

@Controller('tool/search')
export class ToolSearchController {
  constructor(
    private readonly queryBus: QueryBus, 
    private readonly scrapper: ScrapeFromUrls,
  ) {}

  @UseGuards(PublicGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
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

  @UseGuards(PublicGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('lang')
  @Serialize(ToolsSearchResponse)
  async getByFilterWithLang(
    @Query() searchRequest: ToolSearchRequest
  ) {
    const data = await this.queryBus.execute(
        new GetFilteredToolsByLangQuery(
          searchRequest.page,
          searchRequest.pageSize,
          searchRequest.filters
        )
    );

    const total = await this.queryBus.execute(
      new CountToolsByLangQuery(
        searchRequest.filters
      )
    );
    
    const count = !searchRequest.filters.prompt ? total : 0;

    return {
      data,
      count
    }
  }

  @Get('scrap')
  async scrapPruebas() {
    await this.scrapper.excecute();
    return 'OK';
  }
}
