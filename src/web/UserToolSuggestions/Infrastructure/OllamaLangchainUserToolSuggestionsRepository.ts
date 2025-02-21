import { PromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { Ollama } from "@langchain/ollama";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ToolVector } from "@Web/Tool/Domain/tool.vector";
import { CannotConnectToOllamaException } from "@Web/Infrastructure/exception/CannotConnectToOllamaException";

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
		'Chaindesk','Jasper','Luminal','Formula Generator','Freed','Endel','Piggy', 'Google Gemini', 'GPT-3 Playground', 'Monica', 'Multilings'
	];

	constructor(
		private readonly userWebRepository: UserWebRepository,
		// private readonly ToolVectorRepository: ToolVectorRepository,
		private readonly configService: ConfigService
	) {}

	async search(userId: UserWebId): Promise<UserToolSuggestions | null> {

		const user = await this.userWebRepository.search(userId);

		// if (user === null ) {
		// 	return null;
		// }
        

		const chain = RunnableSequence.from([
			PromptTemplate.fromTemplate(`Recomienda inteligencias artificiales similares a {visitedTools}`),
			new Ollama({
				model: "gemma:2b",
				baseUrl: "localhost:11434", // Default value
			}),
		]);

		const suggestions = await chain.invoke({
			visitedTools: ['chatgpt']
		});

		console.log('punto de entrada ...', suggestions);

		//user.visitedTools.map((tool) => `* ${tool}`).join("\n"),

		return UserToolSuggestions.fromPrimitives({
			userId: userId.value,
			visitedTools: ['chatgpt'],
			suggestions
		});
	}

	async save() {}

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
		try{
			const suggestions = await chain.invoke({
				visitedTools: ['chatgpt']
			});

			console.log('las suggestions:', suggestions);

			return UserToolSuggestions.fromPrimitives({
				userId: userId.value,
				visitedTools: ['chatgpt'],
				suggestions
			});
			
		} catch (error) {
			throw CannotConnectToOllamaException.becauseNotFound();
		}

		//user.visitedTools.map((tool) => `* ${tool}`).join("\n"),
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
				baseUrl: "localhost:11434", // Default value
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


	async byPrompt(prompt: string): Promise<any[]> {

		// const availableTools = await this.ToolVectorRepository.searchByQuery(prompt);
		// console.log('availableTools: -- ', availableTools)
		return;
// 		console.log('hola')
// 		const outputParser = StructuredOutputParser.fromZodSchema(
// 			z.array(
// 				z.object({
// 					toolId: z.string().describe("Id del tool sugerido."),
// 					toolName: z
// 						.string()
// 						.describe("Nombre del tool sugerido."),
// 					toolNExcerpt: z
// 						.string()
// 						.describe("Resumen del tool sugerido."),
// 					toolNDescription: z
// 						.string()
// 						.describe("Descripcion completa del tool sugerido."),
// 					reason: z
// 						.string()
// 						.describe("Motivo por el que se sugiere el tool."),
// 				}),
// 			),
// 		);
// 		console.log('hola ?')
// 		const chatPrompt = ChatPromptTemplate.fromMessages([
// 			// Ajustes de system para el prompt
// 			SystemMessagePromptTemplate.fromTemplate(
// 				`
// Eres un avanzado recomendador de recursos de IA. Tu tarea es sugerir al usuario los 3 mejores recursos de IA de una lista proporcionada. Ten en cuenta lo siguiente:
// - Solo puedes elegir recursos de la lista disponible.
// - No sugieras recursos que no estén en la lista que te proporciono.
// - Tus sugerencias son en castellano neutro e inclusivo.
// - Proporciona una razón en castellano para cada curso sugerido. Ejemplo: "Porque has especificado que eres un científico te recomiendo esta aplicación que trabaja con graficos", pero no uses este ejemplo, es solo una guia
// - Intenta añadir en las razones motivos que se especifican en el texto proporcionado.
// - MUY IMPORTANTE: Devuelves un array de objetos, cada uno con las propiedades "toolId" (string), "toolName" (string) y "reason" (string).
// - MUY IMPORTANTE: Devuelves un array de objetos, tienes que seguir a rajatabla las indicaciones y mostrar solo un json, no escribas **Recomendación:**  ni nada por el estilo
// - ATENTO !!  Devuelves un array de objetos
// - En el campo reason empieza siempre mencionando el contenido del prompt recibido, del Texto que define los recursos a recomendar user_prompt
// {format_instructions}
//         `.trim(),
// 			),
// 			// Ajustes de humano para el prompt
// 			HumanMessagePromptTemplate.fromTemplate(
// 				`
// Lista de recursos disponibles (cada curso se presenta con su nombre, resumen y descripcion):

// {available_tools}

// Texto que define los recursos a recomendar. Analiza bien este texto y piensa que recursos le serán mas utiles:

// {user_prompt}
//         `.trim(),
// 			),
// 		]);

// 		const chain = RunnableSequence.from([
// 			chatPrompt,
// 			new Ollama({
// 				model: "gemma:2b",
// 				temperature: 0
// 			}),
// 			outputParser
// 		]);
		
// 			return await chain.invoke({
// 				available_tools: availableTools
// 					.map(this.formatAvailableTools)
// 					.join("\n\n"),
// 				user_prompt: prompt,
// 				format_instructions: outputParser.getFormatInstructions(),
// 			});
		
	}

	formatAvailableTools(tool: ToolVector): string {
		let response =  `
- Id: ${tool.id}
  Nombre: ${tool.name}
  Resumen: ${tool.excerpt}
  Descripcion: ''
		`.trim();
console.log('telit:  a  ', response)
		return response;
	}


	sanitizeResponse(response: string) {
		return response.replace(/```/g, '').trim();
	}
}