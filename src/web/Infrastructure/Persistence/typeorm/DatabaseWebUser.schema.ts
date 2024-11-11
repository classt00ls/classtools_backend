import { EntitySchema } from "typeorm";

export type DatabaseWebUser = {
	id: string;
	visited_tools: string;
	favorites: string;
};

export const UserWebSchema = new EntitySchema<DatabaseWebUser>({
  name: 'Userweb',
  columns: {
    id: {
      type: String,
      primary: true,
      generated: 'uuid',
    },
    favorites: {
      type: String,
      nullable: false
    },
    visited_tools: {
      type: String,
      nullable: true
    }
  }
});
