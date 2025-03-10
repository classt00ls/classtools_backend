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

    async find(event_type: string): Promise<Event[]> {
        return this.repository.find({
            where: {
                event_type
            }
        });
    }
} 