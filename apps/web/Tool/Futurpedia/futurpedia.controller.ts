import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ImportToolByLinkCommand } from 'src/Application/command/tools/ImportToolByLinkCommand';
import { GetAllFuturpediaPageLinksQuery } from 'src/Application/query/tools/GetAllFuturpediaPageLinksQuery';

@Controller('futurpedia')
export class FuturpediaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
  
  /**
   * @description A partir de una ruta del tipo "ai-tools/ ... " hacemos el scrapping de todas las tools 
   * @param route 
   */
  @Post('')
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
      
      const links = await this.queryBus.execute(
          new GetAllFuturpediaPageLinksQuery(routeToscrap)
      )
      for (let link of links) {
          await this.commandBus.execute(
              new ImportToolByLinkCommand(link)
          )
      }
    }
  }
}
