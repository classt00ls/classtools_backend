import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, QueryBus, QueryHandler } from "@nestjs/cqrs";
import puppeteer from 'puppeteer-core';
import { GetAllPageToolsCommand } from "./GetAllPageToolsCommand";
import { ConfigService } from "@nestjs/config";
import { ToolRepository } from "src/Domain/Repository/tool.repository";
import { TagRepository } from "src/Domain/Repository/tag.repository";
import { GetAllFuturpediaPageLinksQuery } from "src/Application/query/tools/GetAllFuturpediaPageLinksQuery";


@CommandHandler(GetAllPageToolsCommand)
@Injectable()
export class GetAllPageToolsCommandHandler implements ICommandHandler<GetAllPageToolsCommand>{
    constructor(
        private readonly configService: ConfigService,
        private readonly queryBus: QueryBus,
        private toolRepository: ToolRepository,
        private tagRepository: TagRepository,
    ) {}

    async execute(command: GetAllPageToolsCommand) {

        const links = await this.queryBus.execute(
            new GetAllFuturpediaPageLinksQuery(command.route)
        )
        
        console.log('tenemos los links: ' + links);

        let counter = 0;
        let browser;
        let page;
        for (let link of links) {
            counter++;
            if(counter > 16) break;

            try {
                await this.toolRepository.getOneByLinkAndFail(link);
            } catch (error) {
                console.log('Ja el tenim ...  continuem.')
                continue;
            }

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
                
                const pricing = await page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText); 
                const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
                const excerpt = await page.$eval('p.my-2', desc => desc.innerText);

                let tool;
                try {
                    await this.toolRepository.getOneByNameAndFail(title);

                    // Creamos la nueva tool asociada al link consultado solo si no falla la función anterior
                    tool = await this.toolRepository.create(
                        {
                            name: title,
                            excerpt,
                            link,
                            url
                        }
                    );

                    tool.tags = allTagsToAdd;

                    const toolSaved = await this.toolRepository.save(tool);
                    
                    console.log(toolSaved);
                   
                } catch (error) {
                    // En este caso si el tool ya existe no hacemos nada

                }
                
            } catch (error) {
                console.log('error al scrapejar: '+link)
                //throw error;
            }

            await browser.close();
        }
    }
}