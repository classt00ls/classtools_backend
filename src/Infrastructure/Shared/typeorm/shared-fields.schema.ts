import { EntitySchemaColumnOptions } from "typeorm"

export const sharedFields : { [key: string] : EntitySchemaColumnOptions } = {
  id: {
    type: String,
    primary: true,
    generated: 'uuid',
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
};
