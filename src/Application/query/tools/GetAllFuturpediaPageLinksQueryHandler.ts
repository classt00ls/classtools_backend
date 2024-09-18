import { GetAllFuturpediaPageLinksQuery } from "./GetAllFuturpediaPageLinksQuery";
import { ConfigService } from "@nestjs/config";
import { CommandHandler, QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import puppeteer from 'puppeteer-core';


@QueryHandler(GetAllFuturpediaPageLinksQuery)
@Injectable()
export class GetAllFuturpediaPageLinksQueryHandler {
    constructor(
        private readonly configService: ConfigService
    ) {}

    async execute(command: GetAllFuturpediaPageLinksQuery) {

        console.log('Obtenemos links de ' + 'https://www.futurepedia.io/' + command.route)
        const SBR_WS_ENDPOINT = 'wss://brd-customer-hl_16ecb6a4-zone-scraping_browser2:l7y9tpevqn75@brd.superproxy.io:9222';
        console.log('La clave: ' + this.configService.getOrThrow('SBR_WS_ENDPOINT'))
        let browser ;

        try {
            browser = await puppeteer.connect({
                browserWSEndpoint: SBR_WS_ENDPOINT // this.configService.getOrThrow('SBR_WS_ENDPOINT')
            })
        } catch (error) {
            console.log('puppeteer error', error)
        }
        

        console.log('puppeteer connected')

        let page = await browser.newPage(); 
        page.setDefaultNavigationTimeout(2 * 60 * 1000);

        
        await Promise.all([
            page.waitForNavigation(),
            page.goto('https://www.futurepedia.io/' + command.route)
        ])
 
        // Recuperamos los links a la pagina de las tools en futurpedia de la ruta especificada
        const links = await page.$$eval("div.items-start", (resultItems) => {
            const urls = [];
            resultItems.map(async resultItem => {
                const url = resultItem.querySelector('a').href;
                if(!urls.includes(url)) urls.push(url);
            });
            return urls;
        })

        await browser.close();

        return links;
    }
}