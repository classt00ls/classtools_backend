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

import { Row } from "postgres";

@Injectable()
export class ScrapeFromUrls {

	public courseUrls = [
		"https://www.futurepedia.io/tool/copyai",
		"https://www.futurepedia.io/tool/hootsuite"
	];

	vectorStore;

	public constructor() {

		this.vectorStore = PGVectorStore.initialize(
			new OllamaEmbeddings({
				model: "nomic-embed-text",
				baseUrl: "http://localhost:11434",
			}),
			{
				postgresConnectionOptions: {
					type: "postgres",
					host: "localhost",
					port: 5431,
					user: "classtools",
					password: "classtools",
					database: "classtools",
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