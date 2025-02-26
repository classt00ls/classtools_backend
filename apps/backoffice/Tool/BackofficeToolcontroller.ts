import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GoogleGeminiProvider } from '@Shared/Infrastructure/IA/GoogleGeminiProvider';

import { ToolExportCommand } from '@Web/Tool/Application/ToolExportCommand';
import { getAllToolsDto } from '@Web/Tool/Domain/getAllTools.dto';
import { GetAllToolsQuery } from 'src/web/Application/Query/Tool/GetAllToolsQuery';
import { Serialize } from 'src/web/Infrastructure/interceptors/serialize.interceptor';

@Controller('backoffice/tool')
export class BackofficeToolController {
  constructor(
    private readonly geminiProvider: GoogleGeminiProvider,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  @Get('')
  @Serialize(getAllToolsDto)
  async getAll(
    @Query('page') page?: number,
		@Query('pageSize') pageSize?: number
  ) {

    const data = await this.queryBus.execute(
      new GetAllToolsQuery(
        page,
        pageSize
      )
    );

    return {
      data
    };

  }

  @Get('generate')
  async generateJson() {

    await this.queryBus.execute(
      new ToolExportCommand(  )
    );
    
  }

  @Get('gemini')
  async gemini(
    @Query('text') text?: string,
  ) {

    const provider = await this.geminiProvider.provide();
    const result = await provider.generateContent(text);

    return result.response.text();
    
  }


  @Get('')
  async getJson() {
    
  }
  
}
