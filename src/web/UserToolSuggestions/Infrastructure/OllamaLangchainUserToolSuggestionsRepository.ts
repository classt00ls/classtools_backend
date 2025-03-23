import { Injectable, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ToolVector } from "@Web/Tool/Domain/tool.vector";
import { CannotConnectToOllamaException } from "@Web/Infrastructure/exception/CannotConnectToOllamaException";

import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";
import { UserWebRepository } from "@Web/UserWeb/Domain/UserWebRepository";
import { EmbeddingRepository } from "@Shared/Embedding/Domain/EmbeddingRepository";
import { EmbeddingResponseService } from "@Shared/Embedding/Domain/EmbeddingResponseService";

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
		@Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository,
		@Inject('EmbeddingResponseService') private readonly embeddingResponseService: EmbeddingResponseService,
		private readonly configService: ConfigService
	) {}

	async search(userId: UserWebId): Promise<UserToolSuggestions | null> {
		const user = await this.userWebRepository.search(userId);

		try {
			// Usamos EmbeddingResponseService en lugar de llamar directamente a Ollama
			const response = await this.embeddingResponseService.respond(
				"Recomienda inteligencias artificiales similares a chatgpt", 
				{
					systemPrompt: `Actúas como un recomendador de inteligencias artificiales avanzado.
					Solo debes sugerir inteligencias artificiales del siguiente array, (IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista):
					${this.existingTools.map((tool) => `- ${tool}`).join("\n")}
					Devuelve únicamente el listado de 4 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono.
					IMPORTANTE No devuelvas nada más que no sea esa lista.`
				}
			);

			return UserToolSuggestions.fromPrimitives({
				userId: userId.value,
				visitedTools: ['chatgpt'],
				suggestions: response.content
			});
		} catch (error) {
			throw CannotConnectToOllamaException.becauseNotFound();
		}
	}

	async byVisitedTools(userId: UserWebId): Promise<UserToolSuggestions | null> {
		const user = await this.userWebRepository.search(userId);

		try {
			// Usamos EmbeddingResponseService en lugar de llamar directamente a Ollama
			const response = await this.embeddingResponseService.respond(
				"chatgpt", 
				{
					systemPrompt: `Actúas como un recomendador de inteligencias artificiales avanzado.
					Solo debes sugerir inteligencias artificiales del siguiente array, (IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista):
					MUY IMPORTANTE!! Asegurate que los nombres sugeridos son exactamente iguales a los de la lista que te proporciono.
					${this.existingTools.map((tool) => `- ${tool}`).join("\n")}
					Devuelve únicamente el listado de 4 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono.
					IMPORTANTE No devuelvas nada más que no sea esa lista.`
				}
			);

			return UserToolSuggestions.fromPrimitives({
				userId: userId.value,
				visitedTools: ['chatgpt'],
				suggestions: response.content
			});
		} catch (error) {
			throw CannotConnectToOllamaException.becauseNotFound();
		}
	}

	async byVisitedAndFavoriteTools(userId: UserWebId): Promise<UserToolSuggestions | null> {
		const user = await this.userWebRepository.search(userId);

		try {
			// Usamos EmbeddingResponseService en lugar de llamar directamente a Ollama
			const response = await this.embeddingResponseService.respond(
				"Recomienda inteligencias artificiales similares a chatgpt", 
				{
					systemPrompt: `Actúas como un recomendador de inteligencias artificiales avanzado.
					Solo debes sugerir inteligencias artificiales del siguiente array, (IMPORTANTE: no incluyas inteligencias artificiales que no estén en la lista):
					${this.existingTools.map((tool) => `- ${tool}`).join("\n")}
					Devuelve únicamente el listado de 4 inteligencias artificiales recomendadas, utilizando formato de un array de json donde cada inteligencia artificial recomendada sea el mismo nombre que te proporciono.
					IMPORTANTE No devuelvas nada más que no sea esa lista.`
				}
			);

			return UserToolSuggestions.fromPrimitives({
				userId: userId.value,
				visitedTools: ['chatgpt'],
				suggestions: response.content
			});
		} catch (error) {
			throw CannotConnectToOllamaException.becauseNotFound();
		}
	}

	async save(): Promise<void> {
		// Implementación necesaria para cumplir con la interfaz
		return Promise.resolve();
	}

	async byPrompt(prompt: string): Promise<any[]> {
		try {
			// Podemos usar el embeddingRepository para buscar herramientas relevantes basadas en el prompt
			const embeddings = await this.embeddingRepository.search(
				prompt,
				5,
				{ type: 'tool' }
			);
			
			// Convertimos los embeddings encontrados a un formato compatible con la respuesta esperada
			return embeddings.map(embedding => ({
				id: embedding.id,
				name: embedding.metadata.name || 'Herramienta sin nombre',
				excerpt: embedding.content.substring(0, 100) + '...',
				description: embedding.content
			}));
		} catch (error) {
			console.error('Error searching embeddings:', error);
			return [];
		}
	}

	formatAvailableTools(tool: ToolVector): string {
		return `
- Id: ${tool.id}
  Nombre: ${tool.name}
  Resumen: ${tool.excerpt}
  Descripcion: ''
		`.trim();
	}
}