import { EntitySchema } from "typeorm";
import { Category } from "@Web/Category/Domain/Category";

export const CategorySchema = new EntitySchema<Category>({
    name: "Category",
    target: Category,
    columns: {
        id: {
            type: String,
            primary: true
        },
        name: {
            type: String
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
            type: Number,
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
                name: "category_tools",
                joinColumn: {
                    name: "category_id",
                    referencedColumnName: "id"
                },
                inverseJoinColumn: {
                    name: "tool_id",
                    referencedColumnName: "id"
                }
            }
        }
    }
}); 