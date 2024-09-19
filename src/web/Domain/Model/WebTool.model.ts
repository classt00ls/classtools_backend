import { BaseModel } from "src/Domain/Shared/base.model";
import { WebTagModel } from "./WebTag.model";


export type WebToolStatus = 'pending' | 'published' //  TODO: add more status

export class WebToolModel extends BaseModel {
  
  // Nombre de la IA tool
  name: string;

  // La descripción completa
  description: string;

  // La descripción corta
  excerpt: string;

  // El estado de la tool changing | pending | published AND more??
  status: WebToolStatus;

  deleted: boolean;

  tags: WebTagModel[];

  uploaded: boolean;

  link: string;

  url: string;

  addTags(tags: WebTagModel[]) {
    for (const tag of tags) {
      if (!(tag instanceof WebTagModel)) {
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
}