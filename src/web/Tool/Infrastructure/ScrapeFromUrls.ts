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
import { DataSource } from "typeorm";

import { Row } from "postgres";

@Injectable()
export class ScrapeFromUrls {
	public courseUrls = [
		"https://www.futurepedia.io/tool/copyai",
		"https://www.futurepedia.io/tool/hootsuite"
	];

	vectorStore: any; // Cambiado a any para poder usar un mock si es necesario
	private embeddingsGenerator: OllamaEmbeddings;

	public constructor(
		private readonly configService?: ConfigService,
		private readonly dataSource?: DataSource
	) {
		// Si se utiliza el modo mock, no intentar conectarse
		const useMock = process.env.USE_MOCK_EMBEDDINGS === 'true' || 
			(this.configService && this.configService.get<string>('USE_MOCK_EMBEDDINGS') === 'true');

		if (useMock) {
			console.log('🚨 ScrapeFromUrls: Usando modo MOCK');
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
			// Configuración para el generador de embeddings
			const ollamaBaseUrl = this.getConfigValue('OLLAMA_BASE_URL', 'http://localhost:11434');
			const ollamaModel = this.getConfigValue('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text');

			this.embeddingsGenerator = new OllamaEmbeddings({
				model: ollamaModel,
				baseUrl: ollamaBaseUrl,
			});

			// Configuración de tabla y columnas
			const tableName = this.getConfigValue('PGVECTOR_TABLE', 'classtools.vectorTool');
			const idColumnName = this.getConfigValue('PGVECTOR_COL_ID', 'id');
			const contentColumnName = this.getConfigValue('PGVECTOR_COL_CONTENT', 'content');
			const metadataColumnName = this.getConfigValue('PGVECTOR_COL_METADATA', 'metadata');
			const vectorColumnName = this.getConfigValue('PGVECTOR_COL_VECTOR', 'embedding');

			// Determinar qué tipo de conexión usar
			if (this.dataSource) {
				console.log('🔄 ScrapeFromUrls: Usando conexión principal de la aplicación');
				
				// Obtener detalles de conexión del DataSource existente
				const connectionOptions = this.getConnectionOptions();
				
				this.vectorStore = PGVectorStore.initialize(
					this.embeddingsGenerator,
					{
						postgresConnectionOptions: connectionOptions,
						tableName: tableName,
						columns: {
							idColumnName: idColumnName,
							contentColumnName: contentColumnName,
							metadataColumnName: metadataColumnName,
							vectorColumnName: vectorColumnName,
						},
						distanceStrategy: "cosine" as DistanceStrategy,
					},
				);
			} else {
				console.log('🔄 ScrapeFromUrls: Usando DATABASE_URL para la conexión');
				
				// Usar DATABASE_URL
				const connectionUrl = this.getConfigValue('DATABASE_URL', '');
				if (!connectionUrl) {
					throw new Error('DATABASE_URL no configurada');
				}
				
				console.log('🔍 ScrapeFromUrls: Usando URL de conexión (sanitizada):', 
					connectionUrl.replace(/:[^:]*@/, ':****@'));
					
				this.vectorStore = PGVectorStore.initialize(
					this.embeddingsGenerator,
					{
						postgresConnectionOptions: {
							connectionString: connectionUrl,
							ssl: this.getConfigValue('PGVECTOR_SSL', 'false') === 'true' ? 
								{ rejectUnauthorized: false } : 
								false,
						} as PoolConfig,
						tableName: tableName,
						columns: {
							idColumnName: idColumnName,
							contentColumnName: contentColumnName,
							metadataColumnName: metadataColumnName,
							vectorColumnName: vectorColumnName,
						},
						distanceStrategy: "cosine" as DistanceStrategy,
					},
				);
			}
			
			console.log('✅ ScrapeFromUrls: Vector store inicializado correctamente');
		} catch (error) {
			console.error('❌ Error inicializando PGVectorStore, usando mock:', error.message);
			
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

	// Método para extraer opciones de conexión del DataSource
	private getConnectionOptions(): any {
		if (!this.dataSource) {
			throw new Error('DataSource no disponible');
		}
		
		const dbConfig = this.dataSource.options as any;
		
		// Verificar si estamos usando URL o parámetros individuales
		if (dbConfig.url) {
			return { 
				connectionString: dbConfig.url,
				ssl: dbConfig.ssl || false
			};
		} else {
			// Fallback a parámetros individuales si no hay URL
			return {
				type: 'postgres',
				host: dbConfig.host,
				port: dbConfig.port,
				user: dbConfig.username,
				password: dbConfig.password,
				database: dbConfig.database,
				ssl: dbConfig.ssl || false,
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