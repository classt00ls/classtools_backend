
import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";
import { ConfigService } from "@nestjs/config";
import { UserToolSuggestions } from "@Web/Domain/Model/UserToolSuggestions/UserToolSuggestions";
import { UserWebId } from "@Web/Domain/ValueObject/UserWebId";

export class OllamaGemmaUserToolSuggestionsGenerator {

	private readonly existingTools = [
		'Chaindesk','Jasper','Luminal','Formula Generator','Freed','Endel','Piggy', 'Google Gemini', 'GPT-3 Playground', 'Monica', 'Multilings'
	];

	constructor(
		private readonly configService: ConfigService
	) {

	}
    async generate(userId: UserWebId) {

        const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`{visitedTools}`),
			SystemMessagePromptTemplate.fromTemplate(`
				 * Actúas como un recomendador de inteligencias artificiales avanzado.
                 * Solo debes sugerir inteligencias artificiales del siguiente array,(IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista)
				 * Solo debes sugerir resultados de la siguiente lista (IMPORTANTE: no incluyas los que no estén en la lista):
				 * MUY IMPORTANTE!! Asegurate que los nombres sugesridos son exactmante iguales a los de la lista que te proporciono
				${this.existingTools.map((ExistingTool) => `\t- ${ExistingTool}`).join("\n")}
                 * Devuelve únicamente el listado de 4 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono
				 * IMPORTANTE No devuelvas nada mas que no sea esa lista
				 *`,
			),
			new Ollama({
				model: "gemma:2b",
				baseUrl: this.configService.getOrThrow('OLLAMA_ROUTE') + ":" + this.configService.getOrThrow('OLLAMA_PORT'), // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: ['chatgpt'],
			suggestions
		});
    }
}