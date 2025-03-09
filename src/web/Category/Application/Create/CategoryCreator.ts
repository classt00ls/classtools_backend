import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "../../Domain/category.repository";
import { Category } from "../../Domain/Category";

@Injectable()
export class CategoryCreator {
    constructor(
        private repository: CategoryRepository
    ) {}

    async create(id: string, name: string): Promise<void> {
        const category = Category.fromPrimitives(
            id,
            name
        );

        await this.repository.save(category);
    }
} 