import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EventOutbox, EventOutboxSchema } from './event-outbox.schema';

@Injectable()
export class EventOutboxRepository {
    private readonly logger = new Logger(EventOutboxRepository.name);
    private repository: Repository<EventOutbox>;

    constructor(private dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(EventOutboxSchema);
    }

    async save(eventType: string, eventData: any): Promise<EventOutbox> {
        try {
            const event = this.repository.create({
                event_type: eventType,
                event_data: eventData,
                status: 'pending',
                retries: 0
            });

            const savedEvent = await this.repository.save(event);
            this.logger.debug(`Evento guardado: ${eventType} (${savedEvent.id})`);
            return savedEvent;
        } catch (error) {
            this.logger.error(`Error al guardar evento ${eventType}: ${error.message}`);
            throw error;
        }
    }

    async getPendingEvents(): Promise<EventOutbox[]> {
        return this.repository.find({
            where: {
                status: 'pending'
            },
            order: {
                created_at: 'ASC'
            }
        });
    }

    async markAsProcessing(eventId: string): Promise<void> {
        await this.repository.update(eventId, {
            status: 'processing'
        });
    }

    async markAsCompleted(eventId: string): Promise<void> {
        await this.repository.update(eventId, {
            status: 'completed',
            processed_at: new Date()
        });
    }

    async markAsFailed(eventId: string, error: string): Promise<void> {
        await this.repository.update(eventId, {
            status: 'failed',
            error_message: error,
            retries: () => 'retries + 1'
        });
    }
} 