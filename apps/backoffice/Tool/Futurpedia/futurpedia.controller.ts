import { Body, Controller, Inject, Post, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateToolInterface } from '@backoffice/Tool/Domain/UpdateToolInterface';
import { ImportToolCommand } from '@backoffice/Tool/Application/ImportToolCommand';

@Controller('backoffice/futurpedia')
export class FuturpediaController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject('UpdateToolInterface') private readonly updateTool: UpdateToolInterface,
    
  ) {}
  
  /**
   * @description A partir de una ruta del tipo "ai-tools/ ... " hacemos el scrapping de todas las tools 
   * @param route 
   */
  @Put('')
  async getWebTools(
    @Body('link') link: string
  ) {
    await this.commandBus.execute(
      new ImportToolCommand(link)
    );

    return {
      statusCode: 200,
      message: 'OK'
    };

   
  }

  @Post('update')
  async updateToolInfo(
    @Body('route') route: string
  ) {

//     const response = [];
//     let page = '';

//     for(let i of [1,2,3,4]) {

//       page = i==1 ? '' : '?page='+i;

//       const routeToscrap = route+page;

// console.log('Buscamos en: ' + routeToscrap);
      
//       const links = await this.queryBus.execute(
//           new GetAllFuturpediaPageLinksQuery(routeToscrap)
//       )

// //console.log(' --------- Los links: ', links); return;

//       for (let link of links) {
//           await this.updateTool.execute(link); 
//       }
//     } 
  }
  
}
