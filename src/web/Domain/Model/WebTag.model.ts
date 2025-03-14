import { BaseModel } from "src/Shared/Domain/Model/base.model";
import { WebToolModel } from "./WebTool.model";

export class WebTagModel extends BaseModel {
  
  // Nombre del tag
  name: string;

  // La descripción completa de la tag
  description: string;

  // La descripción corta
  excerpt: string;

  deleted: boolean;

  tools: WebToolModel[];
}