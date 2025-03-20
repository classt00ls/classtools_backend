import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "../../Domain/category.repository";
import { Category } from "../../Domain/Category";

@Injectable()
export class CategoryCreator {
    constructor(
        private repository: CategoryRepository
    ) {}

    async create(id: string, name: string, tools_num: number = 0): Promise<void> {
        const category = Category.fromPrimitives(
            id,
            name,
            tools_num
        );

        await this.repository.save(category);
    }
} 