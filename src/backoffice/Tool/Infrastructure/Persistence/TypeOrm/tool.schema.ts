import { ToolModel } from "@Backoffice//Tool/Domain/tool.model";
import { EntitySchema } from "typeorm";

export const createToolSchema = (suffix: string = '') => new EntitySchema<ToolModel>({
  name: `Tool${suffix}`,
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
      type: Boolean,
      default: false
    },
    uploaded: {
      type: Boolean,
      default: false
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
    html: {
      type: String,
      nullable: true
    },
    video_html: {
      type: String,
      nullable: true
    },
    video_url: {
      type: String,
      nullable: true
    },
    prosAndCons: {
      type: String,
      nullable: true
    },
    ratings: {
      type: String,
      nullable: true
    },
    howToUse: {
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
        name: `tool_tag${suffix}`,
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

// Exportamos ToolSchema para mantener compatibilidad con código existente
export const ToolSchema = createToolSchema();
