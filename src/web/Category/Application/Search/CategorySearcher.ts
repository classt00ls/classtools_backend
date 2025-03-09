import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "../../Domain/category.repository";
import { Category } from "../../Domain/Category";

@Injectable()
export class CategorySearcher {
    constructor(
        private repository: CategoryRepository
    ) {}

    async search(): Promise<Category[]> {
        return this.repository.findAll();
    }
} 