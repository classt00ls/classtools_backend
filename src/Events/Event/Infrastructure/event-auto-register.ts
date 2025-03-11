import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';

// Este servicio escanea todos los listeners y guarda la relación { tipo de evento → servicio } en un Map.
@Injectable()
export class EventAutoRegisterService implements OnModuleInit {

    private listeners = new Map<string, any>();

    constructor(
        // Este servicio te permite inspeccionar los providers registrados en NestJS y encontrar automáticamente los listeners.
        private readonly discoveryService: DiscoveryService,
        // El reflector es una utilidad proporcionada por NestJS que permite acceder a los metadatos de los decoradores.
        // En este caso, se utiliza para obtener el tipo de evento asociado a un listener específico.
        // Esto se hace mediante el método `get` del reflector, que toma como argumentos el nombre del metadato y el constructor de la clase.
        // Por ejemplo, `this.reflector.get<string>('eventType', instance.constructor)` obtiene el tipo de evento del listener.
        private readonly reflector: Reflector
    ) {}

    onModuleInit() {
        // Aquí estás recuperando todos los proveedores registrados en el módulo de NestJS.
        // La función `getProviders` del `DiscoveryService` devuelve una lista de todos los proveedores.
        // Un proveedor en NestJS es cualquier clase que esté decorada con `@Injectable()`.
        // Estos proveedores pueden ser servicios, repositorios, controladores, etc.
        // En este caso, estás interesado en los listeners de eventos que se registran como proveedores.
        // Luego, recorres cada proveedor para verificar si tiene un tipo de evento asociado.
        // Si un proveedor tiene un tipo de evento, lo registras en el `EventDispatcherService` para que pueda manejar eventos de ese tipo.
        const providers = this.discoveryService.getProviders();

        for (const provider of providers) {
            // La variable `instance` se refiere a la instancia del proveedor actual que se está iterando.
            // En NestJS, un proveedor es una clase que está decorada con `@Injectable()`, lo que significa que puede ser inyectada en otros lugares.
            // La `instance` es la instancia concreta de esa clase que ha sido creada por el contenedor de inyección de dependencias de NestJS.
            // En este contexto, `instance` representa un listener de eventos que ha sido registrado como proveedor.
            // Si `instance` es `null` o `undefined`, significa que el proveedor no tiene una instancia asociada y se omite en la iteración.
            
            const { instance } = provider;

            if (!instance) continue;

            // Si `instance` no es `null`, se procede a obtener el tipo de evento asociado a esa instancia utilizando el reflector.
            // El constructor se utiliza aquí para crear una instancia de la clase del proveedor actual.
            // En NestJS, los proveedores son clases que están decoradas con `@Injectable()`, lo que significa que pueden ser inyectadas en otros lugares.
            // El contenedor de inyección de dependencias de NestJS se encarga de crear instancias de estos proveedores y resolver sus dependencias.
            // Al utilizar el constructor, se puede acceder a los métodos y propiedades de la instancia del proveedor, en este caso, el listener de eventos.
            // Esto es necesario para registrar el listener en el `EventDispatcherService` y manejar eventos de un tipo específico.
            const eventType = this.reflector.get<string>('eventType', instance.constructor);

            if (eventType) {
                console.log(`📌 Registrando listener para ${eventType}`);
                // La línea `this.eventDispatcher.subscribe(eventType, instance.handle.bind(instance));` registra un listener para un tipo de evento específico.
                // `eventType` es el tipo de evento que el listener manejará.
                // `instance.handle.bind(instance)` asegura que el método `handle` del listener se ejecute en el contexto correcto (la instancia del listener).
                // Esto es importante para que el método `handle` pueda acceder a las propiedades y métodos de la instancia del listener.
                // En resumen, esta línea suscribe el listener al `EventDispatcherService` para que pueda manejar eventos del tipo `eventType`.
                this.listeners.set(eventType, instance);
            }
        }// Comenzar el procesamiento de eventos
    }

    getListener(eventType: string) {

        return this.listeners.get(eventType);
        
    }
} 