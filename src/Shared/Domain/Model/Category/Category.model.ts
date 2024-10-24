import { BaseModel } from "src/Shared/Domain/Model/base.model";
import { ToolModel } from "../Tool/tool.model";


export class CategoryModel extends BaseModel {
  
  // Nombre del tag
  name: string;

  // La descripción completa de la tag
  description: string;

  // La descripción corta
  excerpt: string;

  deleted: boolean;

  tools: ToolModel[];
}