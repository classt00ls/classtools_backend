import { Injectable } from '@nestjs/common';
import { EventAutoRegisterService } from './event-auto-register';

@Injectable()
export class EventProcess {
    constructor(
        private readonly eventAutoRegister: EventAutoRegisterService
    ) {}

    async processEvent(eventType: string, eventData: any) {

        // obtiene el listener registrado para el tipo de evento especificado.
        // Utiliza el método `getListener` del servicio `EventAutoRegisterService` para recuperar el listener correspondiente.
        // Si no hay un listener registrado para el tipo de evento, la variable `listener` será `undefined`.
        const listener = this.eventAutoRegister.getListener(eventType);

        if (!listener) {
            console.warn(`⚠️ No hay listener registrado para el evento: ${eventType}`);
            return;
        }

        await listener.handle(eventData);
    }
}