import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";

@Injectable()
export class ToolGetDetailListener {

  constructor(
    private userWebRepository: UserWebRepository
  ) {}

  @OnEvent('web.tool.get_detail', { async: true }) 
  async handleToolCreatedEvent(event: ToolVisitedEvent) {
    console.log('el event: ', event.userId)
    // Recuperamos el userWeb
    const userWeb = await this.userWebRepository.search(new UserWebId(event.userId));
    // Añadimos la visita
    userWeb.addvisitedTool(event.eventName)
    // Guardamos el userWeb
    await this.userWebRepository.save(userWeb);
  }

}