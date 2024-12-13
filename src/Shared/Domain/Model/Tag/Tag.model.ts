import { BaseModel } from "../base.model";
import { ToolModel } from "../Tool/tool.model";

export class TagModel extends BaseModel {
  
  // Nombre del tag
  name: string;

  // La descripción completa de la tag
  description: string;

  // La descripción corta
  excerpt: string;

  deleted: boolean;

  // De momento las categorias no son un módulo propio
  isCategory: number;

  tools: ToolModel[];

  imageUrl: string;

  public upgrade() {
    this.isCategory = 1;
  }

  public downgrade() {
    this.isCategory = 0;
  }
}