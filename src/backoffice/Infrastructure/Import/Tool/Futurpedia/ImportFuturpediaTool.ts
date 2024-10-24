import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagRepository } from "src/Shared/Domain/Repository/tag.repository";
import { ToolCreatedEvent } from "src/Shared/Domain/Event/Tool/ToolCreatedEvent";
import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";
import { PuppeterScrapping } from "../../../../../Shared/Infrastructure/Import/puppeteer/PuppeterScrapping";
import { GetToolTitle } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolTitle";
import { GetToolTags } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolTags";
import { GetToolPricing } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolPricing";
import { GetToolStars } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolStars";
import { GetToolFeatures } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolFeatures";
import { GetToolDescription } from "src/backoffice/Domain/Service/Tool/Futurpedia/GetToolDescription";


@Injectable()

export class ImportFuturpediaTool extends PuppeterScrapping {

    constructor(
        private readonly configService: ConfigService,
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2,
        private tagRepository: TagRepository
    ) {
        super();
    }

    async execute(link: string) {
        let tool;

        try {
            await this.toolRepository.getOneByLinkAndFail(link);
        } catch (error) {
            console.log('Ja el tenim ...  continuem.')
            return;
        }

        let page = await this.getPage(link);

        try {
            const title = await GetToolTitle.execute(page);
            
            try {
                await this.toolRepository.getOneByNameAndFail(title);
            } catch(error) {
                await this.browser.close();
                return;
            }

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
            console.log('error al scrapejar: '+link)
            //throw error;
        }
        await this.browser.close();
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