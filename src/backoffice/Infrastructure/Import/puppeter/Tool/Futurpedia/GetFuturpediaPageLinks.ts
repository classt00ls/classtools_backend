import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import puppeteer, { Browser } from 'puppeteer-core';
import { PuppeterScrapConnectionProvider } from "src/Shared/Infrastructure/Service/Tool/PuppeterScrapConnectionProvider";

/**
 * @description Devuelve todos los links a páginas individuales de IA que encuentra en una página de Futurpedia
 */
@Injectable()
export class GetFuturpediaPageLinks {

    connection_provider: PuppeterScrapConnectionProvider;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.connection_provider = new PuppeterScrapConnectionProvider('wss://brd-customer-hl_4b0402b9-zone-scraping_browser4:3qzhznkob4x4@brd.superproxy.io:9222');
    
    }

    async execute(route: string) {
        
        const browser = await this.connection_provider.getConnection() as Browser;

        let page = await browser.newPage(); 
        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        
        await Promise.all([
            page.waitForNavigation(),
            page.goto('https://www.futurepedia.io/' + route)
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