import { Injectable, Logger } from "@nestjs/common";
import { CategoryCreator } from "../Application/Create/CategoryCreator";
import { CategoryRepository } from "../Domain/category.repository";
import { EventListener } from "@Shared/Infrastructure/decorators/event-listener.decorator";
import { Event } from "@Events/Event/Domain/Event";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { DataSource } from "typeorm";

@EventListener('backoffice.tag.tool.assigned')
@Injectable()
export class ToolAssignedListener {
    private readonly logger = new Logger(ToolAssignedListener.name);

    constructor(
        private categoryCreator: CategoryCreator,
        private categoryRepository: CategoryRepository,
        private dataSource: DataSource
    ) {}

    async handle(event: Event) {
        this.logger.log(`Tool ${event.event_data.toolId} assigned to tag ${event.event_data.tagId}`);

        const repository = new ToolTypeormRepository(this.dataSource, `_en`);

        // Obtener todas las herramientas asociadas al tag
        const tools = await repository.findByTagId(event.event_data.tagId);
        this.logger.log(`El tag ${event.event_data.tagName} tiene ${tools.length} herramientas asociadas`);

        if (tools.length > 10) {
            try {
                await this.categoryRepository.findByIdAndFail(event.event_data.tagId);
                
                this.logger.log(`Tag ${event.event_data.tagName} has been added ${event.event_data.times_added} times. Converting to category...`);
                await this.categoryCreator.create(
                    event.event_data.tagId,
                    event.event_data.tagName
                );
                
                this.logger.log(`Successfully created category from tag ${event.event_data.tagName}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    this.logger.log(`Category already exists for tag ${event.event_data.tagName}`);
                    return;
                }
                this.logger.error(`Error handling tag ${event.event_data.tagName}: ${error.message}`);
            }
        }
    }
} 