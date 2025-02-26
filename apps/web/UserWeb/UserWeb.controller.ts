import { Controller, Get, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';
import { UserWebRepository } from '@Web/UserWeb/Domain/UserWebRepository';

@Controller('userweb')
export class UserWebController {
  constructor(
    
    private readonly repo: UserWebRepository
    
  ) {}

  @Get('delete')
  async getTool(
  ) {

    await this.repo.deleteAll();
    return 'ok';

  }
  
  
}
