import { ToolModel } from "@Backoffice//Tool/Domain/tool.model";
import { EntitySchema } from "typeorm";

export const ToolSchema = new EntitySchema<ToolModel>({
  name: 'Tool',
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
    link: {
      type: String,
      nullable: true
    },
    url: {
      type: String,
      nullable: true
    },
    deleted: {
      type: "integer",
      default: 0
    },
    uploaded: {
      type: "integer",
      default: 0
    },
    status: {
      type: String,
      nullable: true
    },
    features: {
      type: String,
      nullable: true
    }, 
    stars: {
      type: Number,
      nullable: true
    }, 
    pricing: {
      type: String,
      nullable: true
    },
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
