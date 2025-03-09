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
        imageUrl: {
            type: String,
            nullable: true
        }
    }
}); 