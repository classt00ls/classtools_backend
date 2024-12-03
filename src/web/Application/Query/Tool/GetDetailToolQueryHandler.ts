import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { GetDetailToolQuery } from "./GetDetailToolQuery";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolVisitedEvent } from "src/Shared/Application/Event/Tool/ToolVisitedEvent";


@QueryHandler(GetDetailToolQuery)
@Injectable()
export class GetDetailToolQueryHandler {
    constructor(
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2
    ) {}

    async execute(query: GetDetailToolQuery) {

        const tool = await this.toolRepository.getOneByIdOrFail(query.id);
        tool.url = tool.url.split('?')[0];

        if(query.userId) {
            this.eventEmitter.emit(
                'web.tool.get_detail',
                new ToolVisitedEvent(
                    tool.name,
                    query.userId
                ),
              );
        }
        
        return tool;
    }
}