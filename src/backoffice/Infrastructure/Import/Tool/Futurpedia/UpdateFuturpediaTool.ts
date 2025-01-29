import { Injectable } from "@nestjs/common";

import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { GetToolPricing } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolPricing";
import { PuppeterScrapping } from "../../../../../Shared/Infrastructure/Import/puppeteer/PuppeterScrapping";
import { GetToolDescription } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolDescription";
import { GetToolFeatures } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolFeatures";
import { GetToolStars } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolStars";
import { CannotUpdateToolException } from "src/Shared/Domain/Exception/Tool/CannotUpdateToolException";


@Injectable()

export class UpdateFuturpediaTool extends PuppeterScrapping {

    constructor(
        private toolRepository: ToolRepository
    ) {
        super();
    }

    async execute(link: string) {
        let tool;
        try {
            tool = await this.toolRepository.getOneByLinkOrFail(link);
        } catch (error) {
            
            console.log('Eps !  aquest no el tenim: ' + link);
            return;
        }
        

        let page = await this.getPage(link);
        console.log('Si !  aquest el fem: ' + link);
        try {
            const features = await GetToolFeatures.execute(page);
            const stars = await GetToolStars.execute(page); 
            const pricing = await GetToolPricing.execute(page); 
            const description = await GetToolDescription.execute(page);

            tool.description = description;
            tool.features = features;
            tool.pricing = pricing;
            tool.stars = stars;

            //const pageUrl = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
            //const excerpt = await page.$eval('p.my-2', desc => desc.innerText);

            await this.toolRepository.save(tool);
            
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
            console.log('error al scrapejar: '+link)
            //throw error;
        }
        await this.browser.close();
    }

}