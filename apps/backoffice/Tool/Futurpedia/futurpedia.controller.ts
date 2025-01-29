import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ImportToolByLinkCommand } from 'src/backoffice/Application/Command/Tool/ImportToolByLinkCommand';
import { UpdateToolByLinkCommand } from 'src/backoffice/Application/Command/Tool/UpdateToolByLinkCommand';
import { GetAllFuturpediaPageLinksQuery } from 'src/backoffice/Application/Query/Tool/Futurpedia/GetAllFuturpediaPageLinksQuery';
import { ImportToolInterface } from 'src/backoffice/Domain/Tool/ImportToolInterface';
import { UpdateToolInterface } from 'src/backoffice/Domain/Tool/UpdateToolInterface';

@Controller('backoffice/futurpedia')
export class FuturpediaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('UpdateToolInterface') private readonly updateTool: UpdateToolInterface,
    @Inject('ImportToolInterface') private readonly importTool: ImportToolInterface
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

    for(let i of [1,2,3,4,5,6]) {

      page = i==1 ? '' : '?page='+i;  

      const routeToscrap = route+page; 

console.log('Buscamos en: ' + routeToscrap);
      
      const links = await this.queryBus.execute(
          new GetAllFuturpediaPageLinksQuery(routeToscrap)
      )

// console.log(' --------- Los links: ', links); return;

      for (let link of links) {
        await this.importTool.execute(link);
      }
    }
  }

  @Post('update')
  async updateToolInfo(
    @Body('route') route: string
  ) {

    const response = [];
    let page = '';

    for(let i of [1,2,3,4]) {

      page = i==1 ? '' : '?page='+i;

      const routeToscrap = route+page;

console.log('Buscamos en: ' + routeToscrap);
      
      const links = await this.queryBus.execute(
          new GetAllFuturpediaPageLinksQuery(routeToscrap)
      )

//console.log(' --------- Los links: ', links); return;

      for (let link of links) {
          await this.updateTool.execute(link); 
      }
    }
    
   
      
  }
  
}
