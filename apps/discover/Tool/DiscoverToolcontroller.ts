import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSuggestedToolsByUserDescriptionQuery } from 'src/discover/Application/query/Tool/GetSuggestedToolsByUserDescriptionQuery';

@Controller('discover/tool')
export class DiscoverToolcontroller {
  constructor(
    private readonly querybus: QueryBus
  ) {}

  @Post('')
  async getAll(
    @Body() request: any
  ) {

      const response = await this.querybus.execute(
        new GetSuggestedToolsByUserDescriptionQuery(
          request.text
        )
      )

      return {
        message: '',
        data: response
      }
  }


  @Get('')
  async getJson() {
    
  }
  
}
