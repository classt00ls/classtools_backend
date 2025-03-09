import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "../../Domain/category.repository";
import { Category } from "../../Domain/Category";

@Injectable()
export class CategoryCreator {
    constructor(
        private repository: CategoryRepository
    ) {}

    async create(id: string, name: string, description: string): Promise<void> {
        const category = Category.fromPrimitives(
            id,
            name,
            description,
            description.substring(0, 350),
            false,
            1
        );

        await this.repository.save(category);
    }
} 