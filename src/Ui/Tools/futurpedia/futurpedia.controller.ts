import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllPageToolsCommand } from 'src/Application/command/tools/GetAllPageToolsCommand';

@Controller('futurpedia')
export class FuturpediaController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  @Post('webTools')
  async getWebTools(
    @Body('route') route: string
  ) {

    const response = [];
    let page = '';

    for(let i of [1,2,3,4,5]) {

      page = i==1 ? '' : '?page='+i;

      const routeToscrap = route+page;

      console.log('Buscamos en: ' + routeToscrap);

      await this.commandBus.execute(
        new GetAllPageToolsCommand(routeToscrap)
      );

    }
  }
}
