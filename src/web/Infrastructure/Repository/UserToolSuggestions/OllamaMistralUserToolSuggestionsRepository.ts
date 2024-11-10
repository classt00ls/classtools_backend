import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";

import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions.ts/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";


export class OllamaMistralUserToolSuggestionsRepository
	implements UserToolSuggestionsRepository
{
	constructor(private readonly userWebRepository: UserWebRepository) {}

	async search(userId: UserWebId): Promise<UserToolSuggestions | null> {

        // New model userweb
        
		const user = await this.userWebRepository.search(userId);

		if (user === null ) {
			return null;
		}
        

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`Recomienda inteligencias artificiales similares a {visitedTools}`),
			new Ollama({
				model: "mistral",
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: user.visitedTools.map((tool) => `* ${tool}`).join("\n"),
		});

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: user.visitedTools,
			suggestions,
		});
	}
}