
export class ToolCreatedEvent {

  id: string;
  name: string;
  tags: Array<string>

  constructor(
    id: string,
    name: string,
    tags: Array<string>
  ) {
    this.id = id;
    this.name = name;
    this.tags = tags;
  }
  
}