import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { TagModel } from "src/Domain/Model/tag.model";

export const TagSchema = new EntitySchema<TagModel>({
  name: 'Tag',
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
    }
  },
  relations: {
    tools: {
      type: "many-to-many",
      target: "Tool",
      joinColumn: {
        name: 'tool_id',
      },
      inverseSide: 'tags' // Note that this is the relation name in project entity, no the entity name Order
    }
  }
});
