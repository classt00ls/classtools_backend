import { BaseModel } from "../Shared/base.model";
import { CompanyModel } from "./company.model";
import { TagModel } from "./tag.model";

export type ToolStatus = 'pending' | 'published' //  TODO: add more status

export class ToolModel extends BaseModel {
  
  // Nombre de la IA tool
  name: string;

  // La descripción completa
  description: string;

  // La descripción corta
  excerpt: string;

  // El estado de la tool changing | pending | published AND more??
  status: ToolStatus;

  deleted: boolean;

  tags: TagModel[];
}