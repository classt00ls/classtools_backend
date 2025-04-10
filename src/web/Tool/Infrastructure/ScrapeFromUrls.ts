/* eslint-disable no-console */
import "reflect-metadata";

import {
	DistanceStrategy,
	PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PoolConfig } from "pg";
import { chromium } from "playwright";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { Row } from "postgres";

@Injectable()
export class ScrapeFromUrls {
	public courseUrls = [
		"https://www.futurepedia.io/tool/copyai",
		"https://www.futurepedia.io/tool/hootsuite"
	];

	vectorStore: any; // Cambiado a any para poder usar un mock si es necesario
	private embeddingsGenerator: OllamaEmbeddings;

	public constructor(private readonly configService?: ConfigService) {
		// Si se utiliza el modo mock, no intentar conectarse
		const useMock = process.env.USE_MOCK_EMBEDDINGS === 'true' || 
			(this.configService && this.configService.get<string>('USE_MOCK_EMBEDDINGS') === 'true');

		if (useMock) {
			console.log('🚨 ScrapeFromUrls: Usando modo MOCK (sin conexión a base de datos)');
			this.vectorStore = {
				client: { sql: async () => [] },
				addDocuments: async () => {},
				addVectors: async () => {},
				similaritySearch: async () => [],
				asRetriever: () => ({ invoke: async () => [] }),
				end: async () => {},
			};
			
			this.embeddingsGenerator = new OllamaEmbeddings({
				model: "nomic-embed-text",
				baseUrl: "http://localhost:11434",
			});
			return;
		}

		try {
			console.log('🔄 ScrapeFromUrls: Inicializando conexión real a PGVector');
			
			// Obtener configuración de variables de entorno
			const dbHost = this.getConfigValue('PGVECTOR_HOST', 'localhost');
			const dbPort = parseInt(this.getConfigValue('PGVECTOR_PORT', '5432'));
			const dbUser = this.getConfigValue('PGVECTOR_USER', 'classtools');
			const dbPassword = this.getConfigValue('PGVECTOR_PASSWORD', 'classtools');
			const dbName = this.getConfigValue('PGVECTOR_DB', 'classtools');
			const useSSL = this.getConfigValue('PGVECTOR_SSL', 'false') === 'true';
			
			const ollamaBaseUrl = this.getConfigValue('OLLAMA_BASE_URL', 'http://localhost:11434');
			
			console.log('📦 ScrapeFromUrls DB CONFIG:', {
				host: dbHost,
				port: dbPort,
				user: dbUser,
				database: dbName,
				ssl: useSSL,
			});

			this.embeddingsGenerator = new OllamaEmbeddings({
				model: "nomic-embed-text",
				baseUrl: ollamaBaseUrl,
			});

			this.vectorStore = PGVectorStore.initialize(
				this.embeddingsGenerator,
				{
					postgresConnectionOptions: {
						type: "postgres",
						host: dbHost,
						port: dbPort,
						user: dbUser,
						password: dbPassword,
						database: dbName,
						ssl: useSSL ? { rejectUnauthorized: false } : false,
					} as PoolConfig,
					tableName: "classtools.vectorTool",
					columns: {
						idColumnName: "id",
						contentColumnName: "content",
						metadataColumnName: "metadata",
						vectorColumnName: "embedding",
					},
					distanceStrategy: "cosine" as DistanceStrategy,
				},
			);
		} catch (error) {
			console.error('❌ ScrapeFromUrls ERROR inicializando PGVectorStore:', error);
			console.log('⚠️ ScrapeFromUrls: Fallback a modo MOCK por error');
			
			// Crear mock en caso de error
			this.vectorStore = {
				client: { sql: async () => [] },
				addDocuments: async () => {},
				addVectors: async () => {},
				similaritySearch: async () => [],
				asRetriever: () => ({ invoke: async () => [] }),
				end: async () => {},
			};
		}
	}

	// Método auxiliar para obtener valores de configuración
	private getConfigValue(key: string, defaultValue: string): string {
		if (this.configService) {
			const value = this.configService.get<string>(key);
			return value !== undefined ? value : defaultValue;
		}
		return process.env[key] || defaultValue;
	}

	async excecute() {
		const documents = await Promise.all(this.courseUrls.map(this.scrape));

		console.log(documents);

		const vectorStore = await this.vectorStore;

		await vectorStore.addDocuments(documents);
		await vectorStore.end();
	}

	async scrape(url: string): Promise<Document> {
		const browser = await chromium.launch({ headless: true });

		const context = await browser.newContext({ bypassCSP: true });
		const page = await context.newPage();
	
		const courseId = url.split("/").pop()?.replace(".html", "") ?? "";
		
		try {
			await page.goto(url);
	
			const content = await page.evaluate(() => {
				const tags = document.querySelectorAll<HTMLAnchorElement>(
					'p.mt-2.text-ice-700 > a.capitalize',
				);

				const description = document.querySelectorAll<HTMLAnchorElement>(
					'div.prose-slate  .my-2:nth-child(2)',
				);

				const formattedTags = Array.from(tags)
				.map((tag) => {
					return `${tag.innerText}`;
				})
				.join("\n");

				const formattedDescription = Array.from(description)
				.map((description) => {
					return `${description.innerHTML}`;
				})
				.join("\n");
				
				console.log('////////// ', description)
				return `
Descripción
---------------
${formattedDescription}

tags
---------------
${formattedTags}
`.trim();
			});
	
			return new Document({
				id: courseId, // uuid
				pageContent: content,
				metadata: { url },
			});
		} finally {
			await browser.close();
		}
	}
}