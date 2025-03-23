import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConsumeEventsController } from './ConsumeEventsController';
import { ConsumeEventCommandHandler } from '@Events/Event/Application/Command/ConsumeEventCommandHandler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSchema } from '@Events/Event/Infrastructure/Persistence/TypeOrm/event.schema';
import { TypeOrmEventRepository } from '@Events/Event/Infrastructure/Persistence/TypeOrm/TypeOrmEventRepository';
import { NestEventProcess } from '@Events/Event/Infrastructure/NestEventProcess';
import { EventAutoRegister } from '@Events/Event/Infrastructure/event-auto-register';
import { DiscoveryService, Reflector } from '@nestjs/core';
@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([EventSchema])
    ],
    controllers: [
        ConsumeEventsController
    ],
    providers: [
        ConsumeEventCommandHandler,
        DiscoveryService,
        Reflector,
        EventAutoRegister,
        {
            provide: 'EventRepository',
            useClass: TypeOrmEventRepository
        },
        {
            provide: 'EventProcess',
            useClass: NestEventProcess
        }
    ]
})
export class ConsumeEventsModule {} 