import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-core';

@Injectable()
export class FuturpediaService {

    constructor(
        private readonly configService: ConfigService
        ) {}
    
    async getItems() {

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

        const links = await page.$$eval("div.items-start", (resultItems) => {
            const urls = [];
            resultItems.map(async resultItem => {
                const url = resultItem.querySelector('a').href;
                console.log('adding url')
                if(!urls.includes(url)) urls.push(url);
            });
            return urls;
        })

        await browser.close();

        const response = [];

        for (let link of links) {

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
                const title = await page.$eval('h1.text-2xl', h1 => h1.innerText);
                response.push({title})
            } catch (error) {
                
            }

            await browser.close();
        }
        
        console.log(response);
    }
}