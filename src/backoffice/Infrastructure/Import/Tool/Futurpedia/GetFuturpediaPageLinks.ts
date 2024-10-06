import { Injectable } from "@nestjs/common";
import { PuppeterScrapping } from "src/Shared/Infrastructure/Import/puppeteer/PuppeterScrapping";

/**
 * @description Devuelve todos los links a páginas individuales de IA que encuentra en una página de Futurpedia
 */
@Injectable()
export class GetFuturpediaPageLinks extends PuppeterScrapping {


    constructor( ) {
        super();    
    }

    async execute(route: string) {
        
        let page = await this.getPage(route);
 
        // Recuperamos los links a la pagina de las tools en futurpedia de la ruta especificada
        const links = await page.$$eval("div.items-start", (resultItems) => {
            const urls = [];
            resultItems.map(async resultItem => {
                const url = resultItem.querySelector('a').href;
                if(!urls.includes(url)) urls.push(url);
            });
            return urls;
        })

        await this.browser.close();

        return links;
    }
}