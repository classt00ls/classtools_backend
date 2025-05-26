
import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { OpenAI } from "@langchain/openai";
import { ConfigService } from "@nestjs/config";


export class OpenAIUserToolSuggestionsGenerator {

	constructor(
		private configService: ConfigService
	) {}

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
			new OpenAI({
				model: "gpt-3.5-turbo-0125",
				openAIApiKey: this.configService.getOrThrow('OPENAI_API_KEY')
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});
    }
}