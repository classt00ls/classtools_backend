import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';

import { GetFilteredToolsQuery } from '@Web/Tool/Application/search/GetFilteredToolsQuery';
import { ToolSearchRequest } from './tool.search.request';
import { ToolsSearchResponse } from './tool.search.response';
import { CountToolsQuery } from '@Web/Application/Query/Tool/CountToolsQuery';
import { ScrapeFromUrls } from '@Web/Tool/Infrastructure/ScrapeFromUrls';

@Controller('tool/search')
export class ToolSearchController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly scrapper: ScrapeFromUrls,
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
  

  @UseGuards(PublicGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Get('lang')
  @Serialize(ToolsSearchResponse)
  async getByFilterWithLang(
    @Query() searchRequest: ToolSearchRequest
  ) {
    // Añadimos el sufijo del idioma a la tabla
    const suffix = searchRequest.filters.lang ? `_${searchRequest.filters.lang}` : '';
    
    const data = await this.queryBus.execute(
        new GetFilteredToolsQuery(
          searchRequest.page,
          searchRequest.pageSize,
          searchRequest.filters,
          suffix
        )
    );

    const total = await this.queryBus.execute(
      new CountToolsQuery(
        searchRequest.filters,
        suffix
      )
    );
    
    const count = !searchRequest.filters.prompt ? total : 0;

    return {
      data,
      count
    }
  }

  @Get('scrap')
  async scrapPruebas(
  ) {
    
    await this.scrapper.excecute();

    return 'OK';

  }
  
}
