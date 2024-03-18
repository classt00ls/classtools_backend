import { BaseModel } from "../Shared/base.model";
import { ToolModel } from "./tool.model";

export class TagModel extends BaseModel {
  
  // Nombre del tag
  name: string;

  // La descripción completa de la tag
  description: string;

  // La descripción corta
  excerpt: string;

  deleted: boolean;

  tools: ToolModel[];
}