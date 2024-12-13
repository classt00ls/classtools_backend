
import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";

export class OllamaGemmaUserToolSuggestionsGenerator {

    async generate(visited) {

        const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`{visitedTools}`),
			SystemMessagePromptTemplate.fromTemplate(`
				 * Actúas como un recomendador de inteligencias artificiales avanzado.
                 * Solo debes sugerir inteligencias artificiales del siguiente array,(IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista)
				 * Solo debes sugerir resultados de la siguiente lista (IMPORTANTE: no incluyas los que no estén en la lista):
				 ${visited.map((course) => `\t- ${course}`).join("\n")}
                 * Devuelve únicamente el listado de 2 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono
				 * IMPORTANTE No devuelvas nada mas que no sea esa lista`,
			),
			new Ollama({
				model: "gemma:2b",
				baseUrl: "http://ollama:11434", // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});
    }
}