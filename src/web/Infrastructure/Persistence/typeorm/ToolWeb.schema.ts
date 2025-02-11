import { EntitySchema } from "typeorm";

export type DatabaseToolWeb = {
	id: string;
	description: string;
  name: string;
  excerpt: string;
};

export const ToolWebSchema = new EntitySchema<DatabaseToolWeb>({
  name: 'ToolWeb',
  columns: {
    id: {
      type: String,
      primary: true
    },
    description: {
      type: String,
      nullable: true
    },
    name: {
      type: String,
      nullable: false
    },
    excerpt: {
      type: String,
      nullable: false
    },
  }
});
