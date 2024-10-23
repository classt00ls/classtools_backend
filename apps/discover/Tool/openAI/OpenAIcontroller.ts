import { Body, Controller, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { OpenAITextGenerator } from 'src/discover/Infrastructure/openAI/OpenAITextGenerator';

@Controller('discover/openai')
export class OpenAIcontroller {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly openAIService: OpenAITextGenerator
  ) {}

  @Post('')
  async test(
    @Body() request: any
  ) {

    const response = await this.openAIService.execute(
      request.systemText,
      request.userText
    );
    return {
      data: response
    };
  }
  
}
