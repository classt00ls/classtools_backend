import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from       "@nestjs/event-emitter";

import { ToolRepository } from      "@Shared/Domain/Repository/tool.repository";
import { TagRepository } from       "@Shared/Domain/Repository/tag.repository";
import { ToolCreatedEvent } from    "@Shared/Domain/Event/Tool/ToolCreatedEvent";
import { TagModel } from            "@Shared/Domain/Model/Tag/Tag.model";

import { GetToolFuturpediaTitle } from        "src/backoffice/Tool/Domain/Futurpedia/GetToolFuturpediaTitle";
import { GetToolTags } from         "src/backoffice/Tool/Domain/GetToolTags";
import { GetToolPricing } from      "src/backoffice/Tool/Domain/GetToolPricing";
import { GetToolStars } from        "src/backoffice/Tool/Domain/GetToolStars";
import { GetToolFeatures } from     "src/backoffice/Tool/Domain/GetToolFeatures";
import { GetToolDescription } from  "src/backoffice/Tool/Domain/GetToolDescription";

import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
import { ScrapConnectionProvider } from "@Shared/Domain/Service/Tool/ScrapConnectionProvider";

// Implementacio de ToolCreator
// @TODO Ahora mismo aquí es donde se hace todo, intentar llevar lógica al dominio

@Injectable()
export class ImportFuturpediaTool {

    constructor(
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2,
        private tagRepository: TagRepository,
        private scrapProvider: ScrapConnectionProvider
    ) {  }

    public async import(link: string) {
    
        let tool;

        try {
            await this.toolRepository.getOneByLinkAndFail(link);
        } catch (error) {
            console.log('Ja el tenim ... <'+link+'>  continuem.')
            // return;
        }

        let page = await this.scrapProvider.getPage(link);

        try {
            const title = await GetToolFuturpediaTitle.execute(page);
            const tags = await GetToolTags.execute(page);
            const pricing = await GetToolPricing.execute(page);
            const features = await GetToolFeatures.execute(page);
            const stars = await GetToolStars.execute(page); 
            const description = await GetToolDescription.execute(page);
            
            const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
            const excerpt = await page.$eval('p.my-2', desc => desc.innerText);
            
            const allTagsToAdd: TagModel[] = await this.getAllTagsToAddAndSaveNew(tags);
            
            tool = await this.toolRepository.create(
                {
                    id: uuidv6(),
                    name: title, 
                    excerpt,
                    link:link,
                    url,
                    pricing,
                    description,
                    features,
                    stars
                }
            );

            tool.tags = allTagsToAdd;

            const toolSaved = await this.toolRepository.save(tool);

            this.eventEmitter.emit(
                'backoffice.tool.created',
                new ToolCreatedEvent(
                    toolSaved.id,
                    toolSaved.name,
                    tags
                ),
            );
        } catch (error) {
            console.log('error al scrapejar: ', error);
        }
        await this.scrapProvider.closeBrowser();
    }


    private async getAllTagsToAddAndSaveNew(tags) {
        const allTagsToAdd = [];
                
            for(let tag of tags) {
                let new_tag;
                // Evitem els duplicats
                try {
                    // Quan existeix el tag pasem al catch i no el creem
                    await this.tagRepository.getOneByNameAndFail(tag);

                    new_tag = await this.tagRepository.create(
                        {
                            id: uuidv6(),
                            name: tag
                        }
                    );

                    await this.tagRepository.insert(new_tag);
                    
                } catch (error) {
                    new_tag = await this.tagRepository.getOneByNameOrFail(tag);
                }

                allTagsToAdd.push(new_tag);
            }

            return allTagsToAdd;
    }
}