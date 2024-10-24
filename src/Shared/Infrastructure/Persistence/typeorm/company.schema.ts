import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { CompanyModel } from "src/Shared/Domain/Model/Company/company.model";

export const CompanySchema = new EntitySchema<CompanyModel>({
  name: 'Company',
  columns: {
    ...sharedFields,
    email: {
      type: String,
      nullable: true
    },
    name: {
      type: String,
      nullable: false
    },
    street: {
      type: String,
      nullable: true
    },
    city: {
      type: String,
      nullable: true
    },
    country: {
      type: String,
      nullable: true
    },
    cif: {
      type: String,
      nullable: true
    },
    phone: {
      type: String,
      nullable: true
    }, 
    deleted: {
      type: Boolean,
      nullable: true
    },
    monthlySubscriptionStatus: {
      type: String,
      nullable: true
    },
  },
  relations: {
    users: {
      type: "one-to-many",
      target: "User",
      cascade: true,
      inverseSide: 'company' // Note that this is relation name, not the entity name
    }
  }
});
