import { InsertResult, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ToolVectorRepository } from "@Web/Tool/Domain/tool.vector.repository";
import { ToolVector } from "@Web/Tool/Domain/tool.vector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PostgresRepository } from "@Shared/Infrastructure/Persistence/postgres/PostgresRepository";
import { DatabaseToolWeb } from "@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema";

/**
 * Este repositorio usa una conexion a la database echa en pgVector a la que llamamos directamente
 * mediante nuestro propio PostgresRepository
 */

@Injectable()
export class PostgreToolVectorRepository extends PostgresRepository implements ToolVectorRepository{

	private repository : Repository<DatabaseToolWeb>;

	private readonly embeddingsGenerator: OllamaEmbeddings;
	
	constructor( ) {
		super();

		this.embeddingsGenerator = new OllamaEmbeddings({
			model: "nomic-embed-text",
			// @TODO env
			baseUrl: "http://localhost:11434",
		});
	}

	async create(
		model: DatabaseToolWeb
	  ): Promise<DatabaseToolWeb> {
		return await this.repository.create(model);
	  }

	async insert(
		model: ToolVector
	  ): Promise<InsertResult> {
		return await this.repository.insert(model);
	  }
	

	async save(tool: ToolVector): Promise<void> {
		const ToolVectorPrimitives = tool.toPrimitives();

		const embedding =
			await this.generateToolVectorDocumentEmbedding(ToolVectorPrimitives);

		await this.execute`
			INSERT INTO classtools.tools (id, name, excerpt, description, embedding)
			VALUES (
				${ToolVectorPrimitives.id},
				${ToolVectorPrimitives.name},
				${ToolVectorPrimitives.excerpt},
				${ToolVectorPrimitives.description},
				${embedding}
			)
			ON CONFLICT (id) DO UPDATE SET
				name = EXCLUDED.name,
				summary = EXCLUDED.summary,
				categories = EXCLUDED.categories,
				published_at = EXCLUDED.published_at,
				embedding = EXCLUDED.embedding;
		`;
	}	

	/**
	 * 
	 * @param query Texto que ha de permitir realizar la búsqueda
	 * @param limit Limite de resultados, por defecto es 5
	 * @description Realizamos una busqueda vectorial a partir de un texto cualquiera (query) 
	 */
	async search(query: string, limit: number = 5): Promise<ToolVector[]> {
		try {
			const embedding = JSON.stringify(
				await this.embeddingsGenerator.embedQuery(query),
			);

		return await this.connection.sql`
			SELECT id,name, description, excerpt
			FROM classtools.tools
			ORDER BY (embedding <=> ${embedding})
			LIMIT ${limit};
		`;

		} catch (error) {
			return null;
		}
	}

	/**
	 * @param {string[]} ids
	 * @description Proporcionando un conjunto de ids devuelve tools similares
	 */
	async searchSimilarByIds(ids: string[]): Promise<ToolVector[]> {
		try {
			const coursesToSearchSimilar = await this.searchByIds(ids);
			
			const embeddings = await this.generateToolVectorQueryEmbeddings(
				coursesToSearchSimilar.map((tool) => tool.toPrimitives()),
			);

		return await this.searchMany`
			SELECT id, name, excerpt, description
			FROM classtools.tools
			WHERE id != ALL(${ids}::text[])
			ORDER BY (embedding <=> ${embeddings}) 
			LIMIT 4;
		`;
		} catch (error) {
			return null;
		}
	}

	async searchByIds(ids: string[]): Promise<any[]> {
		const plainIds = ids.map((id) => id);

		return await this.searchMany`
			SELECT id, name, excerpt, description
			FROM classtools.tools
			WHERE id = ANY(${plainIds}::text[]);
		`;
	}

	private async generateToolVectorDocumentEmbedding(
		ToolVector,
	): Promise<string> {
		const [vectorEmbedding] = await this.embeddingsGenerator.embedDocuments(
			[this.serializeToolVectorForEmbedding(ToolVector)],
		);

		return JSON.stringify(vectorEmbedding);
	}

	private serializeToolVectorForEmbedding(tool): string {
		return [
			`Id: ${tool.id}`,
			`Name: ${tool.name}`,
			`Excerpt: ${tool.excerpt}`,
			`Description: ${tool.description}`
		].join("|");
	}

	private async generateToolVectorQueryEmbeddings(
		tools
	): Promise<string> {
		const vectorEmbedding = await this.embeddingsGenerator.embedQuery(
			tools
				.map((tool) => this.serializeToolVectorForEmbedding(tool))
				.join("\n"),
		);

		return JSON.stringify(vectorEmbedding);
	}

	protected toAggregate(row: DatabaseToolWeb): ToolVector {
		return ToolVector.fromPrimitives({
			id: row.id,
			name: row.name,
			description: row.description,
			excerpt: row.excerpt
		});
	}
	
}