import { Injectable } from "@nestjs/common";
import { CategoryRepository } from "@Web/Category/Domain/category.repository";
import { Category } from "@Web/Category/Domain/Category";
import { DataSource, Repository } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";

@Injectable()
export class CategoryMysqlRepository extends CategoryRepository {
    private repository: Repository<Category>;

    constructor(
        @InjectDataSource()
        private dataSource: DataSource
    ) {
        super();
        this.repository = this.dataSource.getRepository(Category);
    }

    async find(id: string): Promise<Category> {
        const category = await this.repository.findOne({
            where: { id }
        });

        if (!category) {
            throw new Error(`Category with id ${id} not found`);
        }

        return category;
    }

    async findByIdAndFail(id: string): Promise<void> {
        const category = await this.repository.findOne({
            where: { id }
        });

        if (category) {
            throw new Error(`Category with id ${id} already exists`);
        }
    }

    async findAll(): Promise<Category[]> {
        return this.repository.find();
    }

    async countAll(): Promise<number> {
        return this.repository.count();
    }

    async save(category: Category): Promise<void> {
        await this.repository.save(category);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
} 