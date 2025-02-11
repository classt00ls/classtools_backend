import { Body, Controller, Get, Inject, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { getSuggestionsDto } from 'src/web/Application/Dto/Suggestions/getSuggestions.dto';
// web application DTO
import { getAllToolsDto } from 'src/web/Application/Dto/Tool/getAllTools.dto';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';

import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('user_tool_suggestions')
export class UserToolSuggestionsController {
  constructor(
    @Inject('UserToolSuggestionsSearcher') private searcher: UserToolSuggestionsSearcher,
    private readonly queryBus: QueryBus
    
  ) {}

  @Get('')
  @Serialize(getSuggestionsDto)
  async getAll(
    @Query('id') id?: string
  ) {

  // console.log("Alguien quiere las tools ... ")
    const data = await this.searcher.search(id);

    return data.toPrimitives()

  }

  // Texto proveniente de un input
  @Get('user_prompt')
  @Serialize(getSuggestionsDto)
  async getFromUserPromt(
    @Query('id') id?: string
  ) {

  // console.log("Alguien quiere las tools ... ")
    const data = await this.searcher.search(id);

    return data.toPrimitives()

  }
  
}
