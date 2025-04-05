import { BaseModel } from "@Shared/Domain/Model/base.model";
import { ToolModel } from "@backoffice/Tool/Domain/tool.model";

export class TagModel extends BaseModel {
  
  private constructor(
		public readonly id: string,
		public name: string,
		public description: string,
		public excerpt: string,
		public deleted: boolean,
		public isCategory: number,
		public times_added: number = 0
    ){
		super();
	}

  tools: ToolModel[];

  imageUrl: string;

  public upgrade() {
    this.isCategory = 1;
  }

  public downgrade() {
    this.isCategory = 0;
  }

  public increment() {
    this.times_added++;
  }

  toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      excerpt: this.excerpt,
      description: this.description,
      isCategory: this.isCategory,
      times_added: this.times_added
    }
  }

  static fromPrimitives(
    id: string,
		name: string,
		description: string,
		excerpt: string,
		deleted: boolean,
		isCategory: number,
		times_added: number = 0
  ) {
    return new TagModel(
      id,
      name,
      description,
      excerpt,
      deleted,
      isCategory,
      times_added
    )
  }
}