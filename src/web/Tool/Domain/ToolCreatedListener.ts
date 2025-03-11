import { Injectable, Logger } from "@nestjs/common";
import { ToolCreatedEvent } from "@Backoffice/Tool/Domain/ToolCreatedEvent";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";

@EventListener('backoffice.tool.created')
@Injectable()
export class ToolCreatedListener {
    private readonly logger = new Logger(ToolCreatedListener.name);

    
    async handle(event: ToolCreatedEvent) {
        
        this.logger.log(`Processing tool created event for: ${event.name} (${event.id})`);

        try {
            const vectorStore = await PGVectorStore.initialize(
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
                    },
                    tableName: "classtools.tool_vector",
                    columns: {
                        idColumnName: "id",
                        contentColumnName: "description",
                        vectorColumnName: "embedding",
                        metadataColumnName: "metadata"
                    },
                    distanceStrategy: "cosine",
                }
            );

            const document = await this.createDocument(event);
            
            await vectorStore.addVectors(
                await vectorStore.embeddings.embedDocuments([document.pageContent]),
                [document],
                { ids: [event.id] }
            );
            
            await vectorStore.end();

            this.logger.log(`Successfully processed tool: ${event.name}`);
        } catch (error) {
            this.logger.error(`Error processing tool ${event.name}: ${error.message}`);
            throw new Error(`Error inserting: ${error.message}`);
        }
    }

    private async createDocument(event: ToolCreatedEvent): Promise<Document> {
        const content = `
${event.name}

${event.description}

${event.prosAndCons}

${event.ratings}
`.trim();

        return new Document({
            pageContent: content,
            metadata: {
                id: event.id,
                name: event.name,
                excerpt: event.description.substring(0, 350),
                url: event.url,
                price: event.price,
                tags: event.tags
            }
        });
    }
}