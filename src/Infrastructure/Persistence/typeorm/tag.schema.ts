import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";

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
      nullable: true
    }, 
    excerpt: {
      type: String,
      nullable: true
    },
    deleted: {
      type: Boolean,
      default: false
    },
    isCategory: {
      type: Boolean,
      default: false
    }
  },
  relations: {
    tools: {
      type: "many-to-many",
      target: "Tool",
      joinTable: {
        name: 'tool_tags',
        joinColumns: [{
          name: 'tool_id',
          referencedColumnName: 'id',
        }],
        inverseJoinColumns: [{
          name: 'tag_id',
          referencedColumnName: 'id',
        }],
      },
    }
  }
});
