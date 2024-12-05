import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { GetSuggestedToolsQuery } from "./GetSuggestedToolsQuery";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";


@QueryHandler(GetSuggestedToolsQuery)
@Injectable()
export class GetSuggestedToolsQueryHandler {
    constructor(
        private toolRepository: ToolRepository
        // private getsuggested: GetUserToolSuggestionsFromString
    ) {}
    
    async execute(query: GetSuggestedToolsQuery) {

        const suggestionsArray = JSON.parse(query.suggestions);

        const suggestions = [];

        for (const suggestion of suggestionsArray) {
            const tool = await this.toolRepository.getOneByNameOrFail(suggestion);
            let primitives = tool.toPrimitives();
            suggestions.push(primitives);
        }

        console.log('Result suggestions Tools: ', suggestions);
        return suggestions;
    }
}