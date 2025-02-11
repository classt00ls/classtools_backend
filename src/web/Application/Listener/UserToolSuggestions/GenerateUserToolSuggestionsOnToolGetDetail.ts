import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { UserToolSuggestionsSearcher } from "@Web/Application/Service/UserToolSuggestion/UserToolSuggestionsSearcher";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";

@Injectable()
export class GenerateUserToolSuggestionsOnToolGetDetail {

  constructor(
    private userWebRepository: UserWebRepository,
    private userToolSuggestionsSearcher: UserToolSuggestionsSearcher
  ) {}

  @OnEvent('web.tool.get_detail', { async: true }) 
  async handleToolVisitedEvent(event: ToolVisitedEvent) {
    
    console.log('-------  evento capturado: web.tool.get_detail');

    // Recuperamos el userWeb
    const userWeb = await this.userWebRepository.search(new UserWebId(event.userId));
    // Añadimos la visita
    userWeb.addvisitedTool(event.eventName);

    // Aqui lo ideal es usar un suggestions generator y guardar la sugestion en base de datos
    const suggestions = await this.userToolSuggestionsSearcher.search(event.userId);

    userWeb.setSuggestions(suggestions.suggestions);
    // Guardamos el userWeb
    await this.userWebRepository.save(userWeb);
  }

}