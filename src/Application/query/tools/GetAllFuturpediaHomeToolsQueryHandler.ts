import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import puppeteer from 'puppeteer-core';
import { GetAllFuturpediaHomeToolsQuery } from "./GetAllFuturpediaHomeToolsQuery";
import { ConfigService } from "@nestjs/config";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { TagRepository } from "src/Domain/Repository/tag.repository";


@QueryHandler(GetAllFuturpediaHomeToolsQuery)
@Injectable()
export class GetAllFuturpediaHomeToolsQueryHandler implements IQueryHandler<GetAllFuturpediaHomeToolsQuery>{
    constructor(
        private readonly configService: ConfigService,
        private toolRepository: ToolRepository,
        private tagRepository: TagRepository,
    ) {}

    async execute(query: GetAllFuturpediaHomeToolsQuery) {

        let browser = await puppeteer.connect({
            browserWSEndpoint: this.configService.getOrThrow('SBR_WS_ENDPOINT')
        })

        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);

        await Promise.all([
            page.waitForNavigation(),
            page.goto('https://www.futurepedia.io')
        ])

        // Recuperamos los links a la pagina de las tools en futurpedia de la home
        const links = await page.$$eval("div.items-start", (resultItems) => {
            const urls = [];
            resultItems.map(async resultItem => {
                const url = resultItem.querySelector('a').href;
                if(!urls.includes(url)) urls.push(url);
            });
            return urls;
        })

        await browser.close();

        const response = [];

        let counter = 0;
        for (let link of links) {
            counter++;
            if(counter > 2) break;

            browser = await puppeteer.connect({
                browserWSEndpoint: this.configService.getOrThrow('SBR_WS_ENDPOINT')
            })

            page = await browser.newPage();
            page.setDefaultNavigationTimeout(2 * 60 * 1000);
            
            await page.goto(link)

            try {
                
                // Get title inside page
                const title = await page.$eval('h1.text-2xl', h1 => h1.innerText);

                const tags = await page.$$eval('p.mt-2.text-ice-700 > a.capitalize', tags => {

                    const allTags = tags.map((tag) => {
                        return tag.innerText
                    });

                    return allTags;
                });

                const allTagsToAdd = [];
                
                for(let tag of tags) {
                    const new_tag = await this.tagRepository.create(
                        {
                            name: tag
                        }
                    );

                    await this.tagRepository.insert(new_tag);

                    allTagsToAdd.push(new_tag);

                }
                
                const pricing = await page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText); 
                const link = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
                const excerpt = await page.$eval('p.my-2', desc => desc.innerText);

                
                
                // Creamos la nueva tool asociada al link consultado
                const tool = await this.toolRepository.create(
                    {
                        name: title,
                        excerpt
                    }
                );

                tool.tags = allTagsToAdd;
                
                //tool.addTags([]);

                const toolSaved = await this.toolRepository.save(tool);
                
                console.log(toolSaved);
                
                response.push({
                    title,
                    pricing,
                    tags,
                    link
                })
            } catch (error) {
                throw error;
            }

            await browser.close();
        }
        
        return response;
    }
}