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
    status: {
      type: String,
      nullable: true
    }
  },
  relations: {
    tags: {
      type: "many-to-many",
      target: "Tag",
      cascade: true,
      joinTable: {
        name: "tool_tag",
        joinColumns: [{
          name: 'tool_id',
          referencedColumnName: 'id',
        }],
        inverseJoinColumns: [{
          name: 'tag_id',
          referencedColumnName: 'id',
        }],
      }
    }
  },
  
});
