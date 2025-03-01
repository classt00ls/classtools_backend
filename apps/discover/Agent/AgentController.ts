import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { RespondMessage } from 'src/discover/Agent/Application/RespondMessage';

@Controller('agent')
export class AgentController {
  constructor(
    private readonly respond: RespondMessage
  ) {}

  @Get('ask')
  async ask() {

    const response = this.respond.respond('Hi hola hallo ...  que mas idiomas sabes ?');

    return response;
    
  }
  
}
