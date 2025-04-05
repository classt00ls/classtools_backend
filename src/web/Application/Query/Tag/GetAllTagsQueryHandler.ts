import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { TagRepository } from "@backoffice/Tag/Domain/tag.repository";
import { GetAllTagsQuery } from "src/web/Application/Query/Tag/GetAllTagsQuery";


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