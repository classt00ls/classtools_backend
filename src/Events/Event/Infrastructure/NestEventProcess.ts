import { Injectable } from '@nestjs/common';
import { EventAutoRegister } from './event-auto-register';
import { Event } from '../Domain/Event';

@Injectable()
export class NestEventProcess {
    constructor(
        private readonly eventAutoRegister: EventAutoRegister
    ) {}

    async processEvent(event: Event) {

        // obtiene el listener registrado para el tipo de evento especificado.
        // Utiliza el método `getListener` del servicio `EventAutoRegisterService` para recuperar el listener correspondiente.
        // Si no hay un listener registrado para el tipo de evento, la variable `listener` será `undefined`.
        const listener = this.eventAutoRegister.getListener(event.event_type);

        if (!listener) {
            console.warn(`⚠️ No hay listener registrado para el evento: ${event.event_type}`);
            return;
        }

        await listener.handle(event);
    }
}