import { Body, Controller, Post, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { OpenAIImageFromPromptGenerator } from 'src/discover/Infrastructure/openAI/OpenAIImageFromPromptGenerator';
import { OpenAITextGenerator } from 'src/discover/Infrastructure/openAI/OpenAITextGenerator';

@Controller('discover/openai')
export class OpenAIcontroller {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly openAITextGenerator: OpenAITextGenerator,
    private readonly openAIImageGenerator: OpenAIImageFromPromptGenerator
  ) {}

  @Post('text')
  async text(
    @Body() request: any
  ) {

    const response = await this.openAITextGenerator.execute(
      request.systemText,
      request.userText
    );
    return {
      data: response
    };
  }
  
  @Post('image')
  async image(
    @Body() request: any
  ) {

    const response = await this.openAIImageGenerator.execute(
      request.prompt
    );
    return {
      data: response
    };
  }
}
