import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";

@Injectable()
export class ToolGetDetailListener {

  @OnEvent('web.tool.get_detail', { async: true }) 
  handleToolCreatedEvent(event: ToolVisitedEvent) {
    console.log('Guai !!   ja tenim: ' + event.eventName);

    // Recuperamos el userWeb

    // Añadimos la visita

    // Guardamos el userWeb
  }

}