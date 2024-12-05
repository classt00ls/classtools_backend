import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";
import { Inject, Injectable } from "@nestjs/common";

import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from "src/web/Domain/ValueObject/UserWebId";

@Injectable()
export class OllamaLangchainUserToolSuggestionsRepository
	implements UserToolSuggestionsRepository
{
	// Demo para fase beta
	private readonly existingTools = [
		'Chaindesk','Jasper','Luminal','Formula Generator','Piggy', 'Google Gemini', 'GPT-3 Playground', 'Monica', 'Multilings'
	];

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

	async byVisitedTools(userId: UserWebId): Promise<UserToolSuggestions | null> {

		const user = await this.userWebRepository.search(userId);

		// if (user === null ) {
		// 	return null;
		// }

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`{visitedTools}`),
			SystemMessagePromptTemplate.fromTemplate(`
				 * Actúas como un recomendador de inteligencias artificiales avanzado.
                 * Solo debes sugerir inteligencias artificiales del siguiente array,(IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista)
				 * Solo debes sugerir resultados de la siguiente lista (IMPORTANTE: no incluyas los que no estén en la lista):
				 ${this.existingTools.map((ExistingTool) => `\t- ${ExistingTool}`).join("\n")}
                 * Devuelve únicamente el listado de 3 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono
				 * IMPORTANTE No devuelvas nada mas que no sea esa lista`,
			),
			new Ollama({
				model: "gemma:2b",
				baseUrl: "http://localhost:11434", // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});

		console.log('las suggestions:', suggestions);

		//user.visitedTools.map((tool) => `* ${tool}`).join("\n"),

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: ['chatgpt'],
			suggestions
		});
	}

	async byVisitedAndFavoriteTools(userId: UserWebId): Promise<UserToolSuggestions | null> {

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