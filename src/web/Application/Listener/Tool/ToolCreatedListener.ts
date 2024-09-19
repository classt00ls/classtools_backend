import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "src/web/Domain/Event/Tool/ToolCreatedEvent";

@Injectable()
export class ToolCreatedListener {

  @OnEvent('backoffice.tool.created', { async: true }) 
  handleToolCreatedEvent(event: ToolCreatedEvent) {
    console.log(event);
  }

}