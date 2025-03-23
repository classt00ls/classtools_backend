import { Injectable, Logger } from "@nestjs/common";
import { ToolCreatedEvent } from "@Backoffice/Tool/Domain/ToolCreatedEvent";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";
import { Event } from "@Events/Event/Domain/Event";

@EventListener('backoffice.tool.created')
@Injectable()
export class ToolCreatedListener {
    private readonly logger = new Logger(ToolCreatedListener.name);

    
    async handle(event: Event) {
        
        this.logger.log(`Processing tool created event for: ${event.event_data.name} (${event.id})`);

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

            // 1. Genera embeddings con API del vectorStore
            const embeddings = await vectorStore.embeddings.embedDocuments([document.pageContent]);
            
            await vectorStore.addVectors(
                embeddings,
                [document],
                { ids: [event.aggregate_id] }
            );
            
            await vectorStore.end();

            this.logger.log(`Successfully processed tool: ${event.event_data.name}`);
        } catch (error) {
            this.logger.error(`Error processing tool ${event.event_data.name}: ${error.message}`);
            throw new Error(`Error inserting: ${error.message}`);
        }
    }

    private async createDocument(event: Event): Promise<Document> {
        const content = `
${event.event_data.name}

${event.event_data.description}

${event.event_data.prosAndCons}

${event.event_data.ratings}
`.trim();

        return new Document({
            pageContent: content,
            metadata: {
                id: event.id,
                name: event.event_data.name,
                excerpt: event.event_data.description.substring(0, 350),
                url: event.event_data.url,
                price: event.event_data.price,
                tags: event.event_data.tags
            }
        });
    }
}