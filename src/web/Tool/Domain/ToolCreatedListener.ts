import { Injectable, Logger, Inject } from "@nestjs/common";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";
import { Event } from "@Events/Event/Domain/Event";
import { EmbeddingRepository } from "@Shared/Embedding/Domain/EmbeddingRepository";
import { Embedding } from "@Shared/Embedding/Domain/Embedding";

@EventListener('backoffice.tool.created')
@Injectable()
export class ToolCreatedListener {
    private readonly logger = new Logger(ToolCreatedListener.name);

    constructor(
        @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository
    ) {}
    
    async handle(event: Event) {
        this.logger.log(`Processing tool created event for: ${event.event_data.name} (${event.id})`);

        try {
            // Crear el embedding usando el módulo de Embeddings
            const content = this.createContent(event);
            const metadata = this.createMetadata(event);

            // Crear una instancia de Embedding usando el método estático
            const embedding = Embedding.create(
                event.aggregate_id,
                content,
                metadata
            );

            // Guardar el embedding usando el repositorio
            await this.embeddingRepository.save(embedding);
            
            this.logger.log(`Successfully processed tool: ${event.event_data.name}`);
        } catch (error) {
            this.logger.error(`Error processing tool ${event.event_data.name}: ${error.message}`);
            throw new Error(`Error inserting: ${error.message}`);
        }
    }

    private createContent(event: Event): string {
        // Crear un contenido más estructurado y rico para mejorar la calidad de las búsquedas
        return `
Nombre: ${event.event_data.name}

Descripción: ${event.event_data.description}

Pros y Contras: ${event.event_data.prosAndCons || ''}

Valoraciones: ${event.event_data.ratings || ''}

excerpt: ${event.event_data.description ? event.event_data.excerpt : ''}

Precio: ${event.event_data.price || 'No especificado'}

Tags: ${Array.isArray(event.event_data.tags) ? event.event_data.tags.join(', ') : ''}

URL: ${event.event_data.url || ''}
`.trim();
    }

    private createMetadata(event: Event): Record<string, any> {
        return {
            id: event.id,
            source: 'tool',
            type: 'tool',
            name: event.event_data.name,
            url: event.event_data.url || '',
            price: event.event_data.price || '',
            tags: Array.isArray(event.event_data.tags) ? event.event_data.tags : [],
            createdAt: new Date(),
            updatedAt: new Date(),
            aggregateId: event.aggregate_id,
            eventId: event.id,
            domain: 'backoffice',
            subDomain: 'tool',
            eventType: event.event_type
        };
    }
}