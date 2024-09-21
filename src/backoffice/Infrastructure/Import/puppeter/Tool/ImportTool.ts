import { Injectable } from "@nestjs/common";
import puppeteer from 'puppeteer-core';
import { ConfigService } from "@nestjs/config";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { ToolCreatedEvent } from "src/Shared/Domain/Event/Tool/ToolCreatedEvent";
import { TagModel } from "src/Shared/Domain/Model/Tag/Tag.model";


@Injectable()

export class ImportTool{
    constructor(
        private readonly configService: ConfigService,
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2,
        private tagRepository: TagRepository
    ) {}

    async execute(link: string) {
        let tool;
        try {
            await this.toolRepository.getOneByLinkAndFail(link);
        } catch (error) {
            console.log('Ja el tenim ...  continuem.')
            return;
        }

        const browser = await puppeteer.connect({
            browserWSEndpoint: this.configService.getOrThrow('SBR_WS_ENDPOINT')
        })

        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        
        await page.goto(link);

        try {
            const title = await this.getTitle(page);

            try {
                await this.toolRepository.getOneByNameAndFail(title);
            } catch(error) {
                await browser.close();
                return;
            }

            const tags = await this.getTags(page);

            const pricing = await this.getPricing(page); 

            const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);

            const excerpt = await page.$eval('p.my-2', desc => desc.innerText);
            
            const allTagsToAdd: TagModel[] = await this.getAllTagsToAddAndSaveNew(tags);
            
            tool = await this.toolRepository.create(
                {
                    name: title,
                    excerpt,
                    link:link,
                    url
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
        await browser.close();
    }


    private async getTitle(page) {
        return page.$eval('h1.text-2xl', h1 => h1.innerText);
    }

    private async getPricing(page) {
        return page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText);
    }


    private async getTags(page) {
        return page.$$eval('p.mt-2.text-ice-700 > a.capitalize', tags => {

            const allTags = tags.map((tag) => {
                return tag.innerText
            });

            return allTags;
        });
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