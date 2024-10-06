import { Injectable } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { GetToolTitle } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolTitle";
import { GetToolTags } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolTags";
import { GetToolPricing } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolPricing";
import { PuppeterScrapping } from "../../../../../Shared/Infrastructure/Import/puppeteer/PuppeterScrapping";


@Injectable()

export class UpdateFuturpediaTool extends PuppeterScrapping {

    constructor(
        private readonly configService: ConfigService,
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2,
        private tagRepository: TagRepository
    ) {
        super();
    }

    async execute(url: string) {
        let tool;

        let page = await this.getPage(url);

        try {
            const title = await GetToolTitle.execute(page);
            const tags = await GetToolTags.execute(page);
            const pricing = await GetToolPricing.execute(page); 

            console.log(' Princing: ', pricing);

            const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);

            const excerpt = await page.$eval('p.my-2', desc => desc.innerText);
            
/*
            this.eventEmitter.emit(
                'backoffice.tool.updated',
                new ToolCreatedEvent(
                    toolSaved.id,
                    toolSaved.name,
                    tags
                ),
            );
*/
        } catch (error) {
            console.log('error al scrapejar: '+url)
            //throw error;
        }
        await this.browser.close();
    }

}