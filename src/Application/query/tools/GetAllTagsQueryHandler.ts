import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { GetAllTagsQuery } from "./GetAllTagsQuery";
import { TagRepository } from "src/Domain/Repository/tag.repository";


@QueryHandler(GetAllTagsQuery)
@Injectable()
export class GetAllTagsQueryHandler {
    constructor(
        private tagsRepository: TagRepository
    ) {}

    async execute(command: GetAllTagsQuery) {

        return await this.tagsRepository.getAll();
        
    }
}