import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { GetSuggestedToolsQuery } from "./GetSuggestedToolsQuery";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";


@QueryHandler(GetSuggestedToolsQuery)
@Injectable()
export class GetSuggestedToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository,
        private userRepository: UserWebRepository
        // private getsuggested: GetUserToolSuggestionsFromString
    ) {}
    
    async execute(query: GetSuggestedToolsQuery) {

        const user = await this.userRepository.search(new UserWebId(query.userId));

        const suggestionsArray = JSON.parse(user.suggestions);

        const suggestions = [];

        for (const suggestion of suggestionsArray) {
            const tool = await this.toolRepository.getOneByNameOrFail(suggestion);
            suggestions.push(tool.toPrimitives());
        }

        console.log('Result suggestions Tools: ', suggestions);
        return suggestions;
    }
}