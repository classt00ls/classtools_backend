import { Controller, Inject } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserToolSuggestionsSearcher } from 'src/web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher';

@Controller('userweb')
export class UserWebController {
  constructor(
    
    private readonly queryBus: QueryBus
    
  ) {}
  
  
}
