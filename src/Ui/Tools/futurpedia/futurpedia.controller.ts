import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetAllPageToolsCommand } from 'src/Application/command/tools/GetAllPageToolsCommand';

@Controller('futurpedia')
export class FuturpediaController {
  constructor(
    private readonly commandBus: CommandBus
  ) {}
  
  /**
   * @description A partir de una ruta del tipo "ai-tools/ ... " hacemos el scrapping de todas las tools 
   * @param route 
   */
  @Post('webTools')
  async getWebTools(
    @Body('route') route: string
  ) {

    const response = [];
    let page = '';

    // @Didac TODO: aqui faltaria una query del estil (GetTotalPagesQuery)
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
