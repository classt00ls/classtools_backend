import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "src/Shared/Domain/Event/Tool/ToolCreatedEvent";

@Injectable()
export class ToolCreatedListener {

  @OnEvent('backoffice.tool.created', { async: true }) 
  handleToolCreatedEvent(event: ToolCreatedEvent) {
    console.log(event);
  }

}