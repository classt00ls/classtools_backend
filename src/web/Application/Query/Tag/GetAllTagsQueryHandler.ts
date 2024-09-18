import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { GetAllTagsQuery } from "src/web/Domain/Query/Tag/GetAllTagsQuery";


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