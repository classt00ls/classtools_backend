import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "@Backoffice/Tool/Domain/ToolCreatedEvent";
import { ScrapToolResponse } from "./ScrapResponse";
import { ToolRepository } from "./tool.repository";
import { v6 as uuidv6 } from 'uuid';
import { TagModel } from "@Backoffice/Tag/Domain/Tag.model";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ToolCreator {

	constructor(
		private eventEmitter: EventEmitter2,
		private toolRepository: ToolRepository
	) {}
    
	async create(
		scrappedTool: ScrapToolResponse,
		tags: TagModel[]
	){

        const tool = await this.toolRepository.create(
            {
                id: uuidv6(),
                name: scrappedTool.title, 
                excerpt: scrappedTool.excerpt,
                link:scrappedTool.link,
                url: scrappedTool.url,
                pricing: scrappedTool.pricing,
                description: scrappedTool.description,
                features: scrappedTool.features,
                stars: scrappedTool.stars,
                html: scrappedTool.body_content
            }
        );

		tool.tags = tags;
    

        await this.toolRepository.save(tool);

        this.eventEmitter.emit(
            'backoffice.tool.created',
            new ToolCreatedEvent(
                tool.id,
                tool.name,
                tool.tags.join("\n"),
                tool.description,
                tool.pricing,
                tool.url,
                tool.html,
                tool.video_html
            ),
        );
	};

}