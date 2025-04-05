import { EntitySchema } from "typeorm";
import { sharedFields } from "src/Infrastructure/Shared/typeorm/shared-fields.schema";
import { TagModel } from "@backoffice/Tag/Domain/Tag.model";

export const TagSchema = new EntitySchema<TagModel>({
  name: 'Tag',
  columns: {
    id: {
      type: String,
      primary: true
    },
    createdAt: {
      type: Date,
      createDate: true,
    },
    updatedAt: {
      type: Date,
      nullable: true,
      updateDate: true,
    },
    deletedAt: {
      type: Date,
      nullable: true,
      deleteDate: true,
    },
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
      type: "integer",
      default: 0
    },
    isCategory: {
      type: "integer",
      default: 0
    },
    imageUrl: {
      type: String,
      nullable: true
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
