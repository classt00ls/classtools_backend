import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import puppeteer from 'puppeteer-core';
import { GetAllFuturpediaHomeToolsQuery } from "./GetAllFuturpediaHomeToolsQuery";
import { ConfigService } from "@nestjs/config";


@QueryHandler(GetAllFuturpediaHomeToolsQuery)
@Injectable()
export class GetAllFuturpediaHomeToolsQueryHandler implements IQueryHandler<GetAllFuturpediaHomeToolsQuery>{
    constructor(
        private readonly configService: ConfigService
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
        
        console.log('getting links ...')

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

            console.log('item ...')
            page = await browser.newPage();

            console.log('item page ...')
            page.setDefaultNavigationTimeout(2 * 60 * 1000);

            console.log('item goto ...')
            await page.goto(link)
            
            console.log('getting item ...')

            try {
                // Get title inside page
                const title = await page.$eval('h1.text-2xl', h1 => h1.innerText);

                const tags = await page.$$eval('p.mt-2.text-ice-700 > a.capitalize', tags => {

                    const allTags = tags.map(tag => {
                        return tag.innerText
                    });

                    return allTags;
                });
                console.log('getting tags ...' , tags)
                const pricing = await page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText); 

                console.log('getting pricing ...' , pricing)
                const link = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
                console.log('getting link ...' , link)
                const description = await page.$eval('p.my-2', desc => desc.innerText);
                console.log('getting description ...' , description)

                response.push({
                    title,
                    pricing,
                    tags,
                    link,
                    description
                })
            } catch (error) {
                
            }

            await browser.close();
        }
        
        return response;
    }
}