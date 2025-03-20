import { Injectable } from "@nestjs/common";
import { Category } from "./Category";

@Injectable()
export abstract class CategoryRepository {
    abstract find(id: string): Promise<Category>;
    abstract findByIdAndFail(id: string): Promise<void>;
    abstract findAll(): Promise<Category[]>;
    abstract countAll(): Promise<number>;
    abstract save(category: Category): Promise<void>;
    abstract delete(id: string): Promise<void>;
} 