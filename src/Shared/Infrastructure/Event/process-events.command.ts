import { Injectable, Logger } from '@nestjs/common';
import { EventOutboxRepository } from './event-outbox.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProcessEventsCommand {
    private readonly logger = new Logger(ProcessEventsCommand.name);

    constructor(
        private eventOutboxRepository: EventOutboxRepository,
        private eventEmitter: EventEmitter2
    ) {}
 
    async execute(): Promise<void> {
        try {
            const pendingEvents = await this.eventOutboxRepository.getPendingEvents();
            this.logger.log(`Encontrados ${pendingEvents.length} eventos pendientes`);

            for (const event of pendingEvents) {
                try {
                    await this.eventOutboxRepository.markAsProcessing(event.id);
                    
                    // Emitir el evento
                    await this.eventEmitter.emit(event.event_type, event.event_data);
                    
                    await this.eventOutboxRepository.markAsCompleted(event.id);
                    this.logger.log(`Evento ${event.event_type} (${event.id}) procesado correctamente`);
                } catch (error) {
                    this.logger.error(`Error procesando evento ${event.event_type} (${event.id}): ${error.message}`);
                    await this.eventOutboxRepository.markAsFailed(event.id, error.message);
                }
            }

            this.logger.log('Procesamiento de eventos completado');
        } catch (error) {
            this.logger.error(`Error general procesando eventos: ${error.message}`);
            throw error;
        }
    }
} 