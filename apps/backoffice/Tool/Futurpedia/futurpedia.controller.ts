import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ImportToolByLinkCommand } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommand';
import { UpdateToolByLinkCommand } from 'src/backoffice/Application/Command/Tool/UpdateToolByLinkCommand';
import { GetAllFuturpediaPageLinksQuery } from 'src/backoffice/Application/Query/Tool/Futurpedia/GetAllFuturpediaPageLinksQuery';

@Controller('backoffice/futurpedia')
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

    for(let i of [1,2,3,4,5]) {

      page = i==1 ? '' : '?page='+i;

      const routeToscrap = route+page;

console.log('Buscamos en: ' + routeToscrap);
      
      const links = await this.queryBus.execute(
          new GetAllFuturpediaPageLinksQuery(routeToscrap)
      )

// console.log(' --------- Los links: ', links); return;

      for (let link of links) {
          await this.commandBus.execute(
              new ImportToolByLinkCommand(link)
          )
      }
    }
  }

  @Post('update')
  async updateToolInfo(
    @Body('route') route: string
  ) {
    console.log('Hola ??')
    await this.commandBus.execute(
        new UpdateToolByLinkCommand(route)
    )
      
  }
  
}
