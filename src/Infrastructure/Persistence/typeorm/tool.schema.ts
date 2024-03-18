import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { ToolModel } from "src/Domain/Model/tool.model";

export const ToolSchema = new EntitySchema<ToolModel>({
  name: 'Tool',
  columns: {
    ...sharedFields,
    name: {
      type: String,
      nullable: true
    },
    description: {
      type: String,
      nullable: false
    }, 
    excerpt: {
      type: String,
      nullable: false
    },
    deleted: {
      type: Boolean,
      nullable: true
    },
    status: {
      type: String,
      nullable: true
    }
  },
  relations: {
    tags: {
      type: "many-to-many",
      target: "Tag",
      joinColumn: {
        name: 'tag_id',
      },
      inverseSide: 'tools' // Note that this is the relation name in project entity, no the entity name Order
    }
  }
});
