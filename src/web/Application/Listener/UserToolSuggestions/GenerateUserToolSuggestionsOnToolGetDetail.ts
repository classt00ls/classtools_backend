import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";
import { UserToolSuggestionsSearcher } from "../../Service/UserToolSuggestion/UserToolSuggestionsSearcher";

@Injectable()
export class GenerateUserToolSuggestionsOnToolGetDetail {

  constructor(
    private userWebRepository: UserWebRepository,
    private userToolSuggestionsSearcher: UserToolSuggestionsSearcher
  ) {}

  @OnEvent('web.tool.get_detail', { async: true }) 
  async handleToolCreatedEvent(event: ToolVisitedEvent) {
    console.log('buscamos el userweb: ', event.userId)
    // Recuperamos el userWeb
    const userWeb = await this.userWebRepository.search(new UserWebId(event.userId));
    // Añadimos la visita
    userWeb.addvisitedTool(event.eventName);

    const suggestions = await this.userToolSuggestionsSearcher.search(event.userId);
    
    userWeb.setSuggestions(suggestions.suggestions);
    // Guardamos el userWeb
    await this.userWebRepository.save(userWeb);
  }

}