import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolAssignedEvent } from "@Backoffice/Tag/Domain/ToolAssignedEvent";
import { CategoryCreator } from "../Application/Create/CategoryCreator";
import { CategoryRepository } from "../Domain/category.repository";

@Injectable()
export class ToolAssignedListener {
    private readonly logger = new Logger(ToolAssignedListener.name);

    constructor(
        private categoryCreator: CategoryCreator,
        private categoryRepository: CategoryRepository
    ) {}

    @OnEvent('backoffice.tag.tool.assigned', { async: true })
    async handleToolAssignedEvent(event: ToolAssignedEvent) {
        this.logger.log(`Tool ${event.toolId} assigned to tag ${event.tagId}`);

        if (event.times_added > 5) {
            try {
                await this.categoryRepository.findByIdAndFail(event.tagId);
                
                this.logger.log(`Tag ${event.tagName} has been added ${event.times_added} times. Converting to category...`);
                await this.categoryCreator.create(
                    event.tagId,
                    event.tagName
                );
                
                this.logger.log(`Successfully created category from tag ${event.tagName}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    this.logger.log(`Category already exists for tag ${event.tagName}`);
                    return;
                }
                this.logger.error(`Error handling tag ${event.tagName}: ${error.message}`);
            }
        }
    }
} 