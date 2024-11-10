import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";

import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";

import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions.ts/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";


export class OllamaMistralUserToolSuggestionsRepository
	implements UserToolSuggestionsRepository
{
	constructor(private readonly userRepository: UserRepository) {}

	async search(userId: UserId): Promise<UserToolSuggestions | null> {

        // New model userweb
        /*
		const user = await this.userRepository.search(userId);

		if (user === null || !user.hasCompletedAnyCourse()) {
			return null;
		}
        */

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`Recomienda cursos similares a {completedCourses}`),
			new Ollama({
				model: "mistral",
			}),
		]);

		const suggestions = await chain.invoke({
			completedCourses: user.completedCourses.map((course) => `* ${course}`).join("\n"),
		});

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: user.completedCourses,
			suggestions,
		});
	}
}