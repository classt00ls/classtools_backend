import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolAssignedEvent } from "@Backoffice/Tag/Domain/ToolAssignedEvent";
import { CategoryCreator } from "../Application/Create/CategoryCreator";

@Injectable()
export class ToolAssignedListener {
    private readonly logger = new Logger(ToolAssignedListener.name);

    constructor(
        private categoryCreator: CategoryCreator
    ) {}

    @OnEvent('backoffice.tag.tool.assigned', { async: true })
    async handleToolAssignedEvent(event: ToolAssignedEvent) {
        this.logger.log(`Tool ${event.toolId} assigned to tag ${event.tagId}`);

        if (event.times_added > 5) {
            this.logger.log(`Tag ${event.tagName} has been added ${event.times_added} times. Converting to category...`);
            
            try {
                await this.categoryCreator.create(
                    event.tagId,
                    event.tagName
                );
                
                this.logger.log(`Successfully created category from tag ${event.tagName}`);
            } catch (error) {
                this.logger.error(`Error creating category from tag ${event.tagName}: ${error.message}`);
            }
        }
    }
} 