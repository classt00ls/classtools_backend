import { Controller, Get, Put, Query, Request, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
// web application DTO
// web application Queries
import { CountToolsQuery } from 'src/web/Application/Query/Tool/CountToolsQuery';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { GetDetailToolQuery } from 'src/web/Application/Query/Tool/GetDetailToolQuery';
import { GetToolBySlugQuery } from 'src/web/Application/Query/Tool/GetToolBySlugQuery';
import { GetFavoriteToolsQuery } from 'src/web/Tool/Application/search/GetFavoriteToolsQuery';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';
import { PublicGuard } from 'src/Shared/Infrastructure/guards/public.guard';
import { AuthGuard } from '@Shared/Infrastructure/guards/auth.guard';
import { FilterDto } from '@Web/Tool/Domain/filterTools.dto';
import { getDetailToolDto } from '@web/Tool/getDetailTool.dto';
import { getAllToolsDto } from '@Web/Tool/Domain/getAllTools.dto';
import { ToggleFavoriteCommand } from '@Web/UserWeb/Application/ToggleFavoriteCommand';
import { TokenAuthGuard } from '@Web/Infrastructure/guard/token.auth.guard';
import { UserWebId } from '@Web/UserWeb/Domain/UserWebId';
import { FavoriteToolsDto } from '@Web/Tool/Domain/favoriteTools.dto';

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
    @Query('id') id: string,
    @Query('lang') lang?: string
  ) {
    const userId = request.userId;

    const data = await this.queryBus.execute(
        new GetDetailToolQuery(
          id,
          userId,
          lang
        )
    );

    return data;
  }
  
  @Get('favorite')
  @UseGuards(TokenAuthGuard)
  @Serialize(FavoriteToolsDto)
  async getFavorites(
    @Request() request,
    @Query('lang') lang?: string
  ) {
    const userId = request.userId;

    const tools = await this.queryBus.execute(
      new GetFavoriteToolsQuery(
        userId,
        lang
      )
    );

    return tools;
  }

  @Put('favorite')
  @UseGuards(TokenAuthGuard)
  async favorite(
    @Request() request,
    @Query('id') id: string,
    // @Query('user_id') user_id: string
  ) {

    const userId = request.userId;

    const data = await this.queryBus.execute(
       new ToggleFavoriteCommand(
        userId,
        id
       )
    );



    return data;
  }

  @Get('slug')
  @UseGuards(PublicGuard)
  @Serialize(getDetailToolDto)
  async getBySlug(
    @Request() request,
    @Query('title') slug: string,
    @Query('lang') lang?: string
  ) {
    const userId = request.userId;

    console.log("=============== userID ", userId);

    const data = await this.queryBus.execute(
        new GetToolBySlugQuery(
          slug,
          userId,
          lang
        )
    );

    return data;
  }

  @Get('')
  async getJson() {
    
  }
  
}
