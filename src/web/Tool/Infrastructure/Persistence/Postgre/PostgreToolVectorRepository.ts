import { InsertResult, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { ToolVectorRepository } from "@Web/Tool/Domain/tool.vector.repository";
import { ToolVector } from "@Web/Tool/Domain/tool.vector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PostgresRepository } from "@Shared/Infrastructure/Persistence/postgres/PostgresRepository";
import { DatabaseToolWeb } from "@Web/Infrastructure/Persistence/typeorm/ToolWeb.schema";


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

		await this.repository.save({
			id: ToolVectorPrimitives.id,
			excerpt: ToolVectorPrimitives.excerpt,
			name: ToolVectorPrimitives.name
		});

	}

	async search(query: string): Promise<ToolVector[]> {
		try {
			
			// await executePrompt(query);

			const embedding = JSON.stringify(
				await this.embeddingsGenerator.embedQuery(query),
			);

		return await this.connection.sql`
			SELECT id,name, description, excerpt
			FROM classtools.tools
			ORDER BY (embedding <=> ${embedding})
			LIMIT 4;
		`;

		} catch (error) {
			return null;
		}
	}

	async searchSimilar(ids: string[]): Promise<ToolVector[]> {
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
			SELECT id, name, excerpt
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
			`Tool: ${tool.name}`,
			`Excerpt: ${tool.excerpt}`
		].join("|");
	}

	private async generateToolVectorQueryEmbeddings(
		tools
	): Promise<string> {
		const vectorEmbedding = await this.embeddingsGenerator.embedQuery(
			tools
				.map((course) => this.serializeToolVectorForEmbedding(course))
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