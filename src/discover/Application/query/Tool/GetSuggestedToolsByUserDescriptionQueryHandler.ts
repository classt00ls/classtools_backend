import { Injectable } from "@nestjs/common";
import { CommandBus, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { GetSuggestedToolsByUserDescriptionQuery } from "./GetSuggestedToolsByUserDescriptionQuery";
import { ToolRepository } from "@backoffice/Tool/Domain/tool.repository";
import { SuggestionsGenerator } from "src/discover/Domain/Tool/SuggestionsGenerator";



@QueryHandler(GetSuggestedToolsByUserDescriptionQuery)
@Injectable()
export class GetSuggestedToolsByUserDescriptionQueryHandler implements IQueryHandler<GetSuggestedToolsByUserDescriptionQuery>{
    constructor(
        private readonly toolRepository: ToolRepository,
        private suggestionsGenerator: SuggestionsGenerator
    ) {}

    async execute(query: GetSuggestedToolsByUserDescriptionQuery) {
		const response = await this.suggestionsGenerator.generate(
            query.userText
          );
          
          console.log('response: ', response)
          const suggestionsArray = JSON.parse(response);
    
            const suggestions = [];
    
            for (const suggestion of suggestionsArray) {
                const tool = await this.toolRepository.getOneByNameOrFail(suggestion);
                suggestions.push(tool.toPrimitives());
            }
    
            return suggestions;
  	}
}