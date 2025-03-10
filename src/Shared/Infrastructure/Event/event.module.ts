import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventOutboxSchema } from './event-outbox.schema';
import { EventOutboxRepository } from './event-outbox.repository';
import { ProcessEventsCommand } from './process-events.command';

@Module({
    imports: [
        TypeOrmModule.forFeature([EventOutboxSchema])
    ],
    providers: [
        EventOutboxRepository,
        ProcessEventsCommand
    ],
    exports: [
        EventOutboxRepository
    ]
})
export class EventModule {} 