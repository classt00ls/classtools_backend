import { Body, Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
// web application DTO
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion.ts/UserToolSuggestionsSearcher';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('user_tool_suggestions')
export class UserToolSuggestionsController {
  constructor(
    private readonly queryBus: QueryBus,
    private searcher: UserToolSuggestionsSearcher
  ) {}

  @Get('')
  @Serialize(getAllToolsDto)
  async getAll(
    @Query('id') id?: string
  ) {

  // console.log("Alguien quiere las tools ... ")
    const data = await this.searcher.search(id);

    return {
      data
    }

  }
  
}
