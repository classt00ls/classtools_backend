import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";

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
      type: "integer",
      default: 0
    },
    deleted: {
      type: "integer",
      default: 0
    },
    role: {
      type: String,
      nullable: true
    },
    company: {
      type: String, // Tipo UUID para la columna de clave foránea
      nullable: true, // Esto depende de si permites valores nulos o no
    },
  }
});
