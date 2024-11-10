import { EntitySchema } from "typeorm";

export type DatabaseWebUser = {
	id: string;
	visitedTools: string;
	favorites: string;
};

export const UserWebSchema = new EntitySchema<DatabaseWebUser>({
  name: 'UserWeb',
  columns: {
    id: {
      type: String,
      nullable: true
    },
    favorites: {
      type: String,
      nullable: false
    },
    visitedTools: {
      type: String,
      nullable: true
    }
  }
});
