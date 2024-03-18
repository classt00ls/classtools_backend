import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { UserModel } from "src/Domain/Model/user.model";

export const UserSchema = new EntitySchema<UserModel>({
  name: 'User',
  columns: {
    ...sharedFields,
    email: {
      type: String,
      nullable: true
    },
    password: {
      type: String,
      nullable: false
    }, 
    name: {
      type: String,
      nullable: false
    },
    surname: {
      type: String,
      nullable: true
    },
    phone: {
      type: String,
      nullable: true
    }, 
    confirmed: {
      type: Boolean,
      nullable: true
    },
    deleted: {
      type: Boolean,
      nullable: true
    },
    role: {
      type: String,
      nullable: true
    }
  },
  relations: {
    company: {
      type: "many-to-one",
      target: "Company",
      joinColumn: {
        name: 'company_id',
      },
      inverseSide: 'users' // Note that this is the relation name in project entity, no the entity name Order
    }
  }
});
