export class ToolCreatedEvent {

  id: string;
  name: string;
  tags: string;
  description: string;
  price: string;
  url: string;
  html: string;
  video_content: string;
  video_url: string;
  prosAndCons: string;

  constructor(
    id: string,
    name: string,
    tags: string,
    description: string,
    price: string,
    url: string,
    html: string,
    video_content: string,
    video_url: string,
    prosAndCons: string
  ) {
    
    this.id = id;
    this.name = name;
    this.tags = tags;
    this.description = description;
    this.price = price;
    this.url = url;
    this.html = html;
    this.video_content = video_content;
    this.video_url = video_url;
    this.prosAndCons = prosAndCons;
  }
  
}