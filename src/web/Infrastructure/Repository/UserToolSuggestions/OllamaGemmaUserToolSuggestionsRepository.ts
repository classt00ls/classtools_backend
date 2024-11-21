import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";
import { Inject, Injectable } from "@nestjs/common";

import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";

@Injectable()
export class OllamaGemmaUserToolSuggestionsRepository
	implements UserToolSuggestionsRepository
{
	constructor(private readonly userWebRepository: UserWebRepository) {}

	async search(userId: UserWebId): Promise<UserToolSuggestions | null> {

		const user = await this.userWebRepository.search(userId);

		// if (user === null ) {
		// 	return null;
		// }
        

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`Recomienda inteligencias artificiales similares a {visitedTools}`),
			new Ollama({
				model: "gemma:2b",
				baseUrl: "http://localhost:11434", // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});

		console.log(suggestions);

		//user.visitedTools.map((tool) => `* ${tool}`).join("\n"),

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: ['chatgpt'],
			suggestions
		});
	}
}