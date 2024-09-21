import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { GetAllCategoriesQuery } from "./GetAllCategoriesQuery";


@QueryHandler(GetAllCategoriesQuery)
@Injectable()
export class GetAllCategoriesQueryHandler {
    constructor(
        private tagsRepository: TagRepository
    ) {}

    async execute(command: GetAllCategoriesQuery) {

        return await this.tagsRepository.getAllCategories();
        
    }
}