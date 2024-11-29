import { ApplicationEvent } from "../ApplicationEvent";

export class ToolVisitedEvent {

  eventName: string;
  userId: string;

  constructor(
    eventName: string,
    userId: string
  ) {
    this.eventName = eventName;
    this.userId = userId;
  }
  
}