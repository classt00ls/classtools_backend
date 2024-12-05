import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";
import { BaseModel } from "../base.model";

export type ToolStatus = 'pending' | 'published' //  TODO: add more status

export class ToolModel extends BaseModel {
  
  // Nombre de la IA tool
  name: string;

  pricing: string;

  stars: Number;

  // La descripción completa
  description: string;

  // Las características con formato html
  features: string;

  // La descripción corta
  excerpt: string;

  // El estado de la tool changing | pending | published AND more??
  status: ToolStatus;

  deleted: boolean;

  tags: TagModel[];

  uploaded: boolean;

  link: string;

  url: string;

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

  public toPrimitives() {
    return {
      name: this.name,
      excerpt: this.excerpt,
      link: this.link
    }
  }
}