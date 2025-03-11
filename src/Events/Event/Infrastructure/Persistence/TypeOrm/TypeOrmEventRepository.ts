import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Event } from '../../../Domain/Event';
import { EventRepository } from '../../../Domain/event.repository';
import { EventSchema } from './event.schema';

@Injectable()
export class TypeOrmEventRepository implements EventRepository {
    private repository: Repository<Event>;

    constructor(
        private dataSource: DataSource
    ) {
        this.repository = this.dataSource.getRepository(EventSchema);
    }

    async create(event: Event): Promise<void> {
        await this.repository.save(event);
    }

    async find(event_type: string, limit?: number): Promise<Event[]> {
        const events = await this.repository.find({
            where: {
                event_type,
                status: 'pending'
            },
            take: limit
        });

        return events.map(event => Event.fromPrimitives(
            event.id,
            event.event_type,
            event.event_data,
            event.aggregate_id,
            event.created_at,
            event.processed_at,
            event.status,
            event.error_message,
            event.retries
        ));
    }

    async save(event: Event): Promise<void> {
        await this.repository.save(event);
    }
} 