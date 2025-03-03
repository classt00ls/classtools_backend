import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";
import { BaseModel } from "../base.model";

export type ToolStatus = 'pending' | 'published' //  TODO: add more status

export class ToolModel extends BaseModel {

  // El estado de la tool changing | pending | published AND more??

  deleted: boolean;

  uploaded: boolean;

  private constructor(
		public readonly id: string,
		public name: string,
		public pricing: string,
		public stars: number,
		public description: string,
		public features: string,
    public excerpt: string,
    public tags: TagModel[],
    public link: string,
    public url: string,
    public status: ToolStatus
    ){
		super();
    this.deleted = false;
    this.uploaded = true;
	}

  addTags(tags: TagModel[]) {
    for (const tag of tags) {
      if (!(tag instanceof TagModel)) {
        throw new Error('Invalid tag provided. Only Tag instances allowed.');
      }
    }

    // Añadir tags a la lista
    for (const tag of tags) {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    }
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      excerpt: this.excerpt,
      url: this.url
    }
  }

  static fromPrimitives(
    id: string,
		name: string,
		pricing: string,
		stars: number,
		description: string,
		features: string,
    excerpt: string,
    tags: TagModel[],
    link: string,
    url: string,
    status: ToolStatus
  ) {
    return new ToolModel(
      id,
      name,
      pricing,
      stars,
      description,
      features,
      excerpt,
      tags,
      link,
      url,
      status
    )
  }
}