import { Controller, Get } from '@nestjs/common';
import { FuturpediaService } from 'src/Shared/Service/scrapping/futurpedia.service';

@Controller('futurpedia')
export class FuturpediaController {
  constructor(private readonly futurpediaService: FuturpediaService) {}

  @Get('items')
  getItems() {

    return this.futurpediaService.getItems();

  }
}
