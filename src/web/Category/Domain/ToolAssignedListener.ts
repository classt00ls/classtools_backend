import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { ToolAssignedEvent } from "@Backoffice/Tag/Domain/ToolAssignedEvent";

@Injectable()
export class ToolAssignedListener {
    private readonly logger = new Logger(ToolAssignedListener.name);

    @OnEvent('backoffice.tag.tool.assigned', { async: true })
    async handleToolAssignedEvent(event: ToolAssignedEvent) {
        this.logger.log(`Tool ${event.toolId} assigned to tag ${event.tagId}`);
    }
} 