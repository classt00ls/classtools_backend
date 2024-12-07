import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";
import { Inject, Injectable } from "@nestjs/common";


@Injectable()
export class OllamaGemmaToolSuggestionsGenerator
{

	private readonly existingTools = [
		'Chaindesk','Jasper','Luminal','Formula Generator','Freed','Endel','Piggy', 'Google Gemini', 'GPT-3 Playground', 'Monica', 'Multilings'
	];

	async generate(userText: string) {

        const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`{userText}`),
			SystemMessagePromptTemplate.fromTemplate(`
				 * Actúas como un recomendador de inteligencias artificiales avanzado.
				 * Debes recomendar Inteligencias artificiales a partir del texto que incluyo en el template.
				 * Se adjunta un texto donde se explican las características profesionales en funcion del cual debes realizar la recomendación.
                 * Solo debes sugerir inteligencias artificiales del siguiente array,(IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista)
				 * Solo debes sugerir resultados de la siguiente lista (IMPORTANTE: no incluyas los que no estén en la lista):
				 ${this.existingTools.map((tool) => `\t- ${tool}`).join("\n")}
                 * Devuelve únicamente el listado de 3 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono
				 * IMPORTANTE No devuelvas nada mas que no sea esa lista
				 `,
			),
			new Ollama({
				model: "gemma:2b",
				baseUrl: "http://localhost:11434", // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			userText: userText
		});

		return suggestions;
    }
}