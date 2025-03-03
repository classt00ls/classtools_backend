import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { RespondMessage } from 'src/discover/Agent/Application/RespondMessage';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly respond: RespondMessage
  ) {}

  @Get('ask')
  async ask(
    @Query('ask') question: string
  ) {

    const response = this.respond.respond(question);

    return response;
    
  }
  
}
