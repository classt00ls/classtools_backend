import { Injectable, Logger } from "@nestjs/common";

import { GetToolFuturpediaTitle } from        "@Backoffice/Tool/Domain/Futurpedia/GetToolFuturpediaTitle";
import { GetToolTags } from         "@Backoffice/Tool/Domain/GetToolTags";
import { GetToolPricing } from      "@Backoffice/Tool/Domain/GetToolPricing";
import { GetToolStars } from        "@Backoffice/Tool/Domain/GetToolStars";

import { ScrapConnectionProvider } from "@Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { ScrapToolResponse } from "../Domain/ScrapResponse";

// Implementacio de ToolCreator
// @TODO Ahora mismo aquí es donde se hace todo, intentar llevar lógica al dominio

@Injectable()
export class ScrapToolLinksFromFuturpedia {

    constructor(
        private scrapProvider: ScrapConnectionProvider
    ) { }

    async scrap(url: string): Promise<Array<string>> {  

        let response: Array<string> = [];

        for(let i of [1,2,3]) {
            let page = i == 1 ? '' : '?page='+i;  
            const routeToscrap = url + page; 

            const browser = await this.scrapProvider.getConnection();
            let page_to_scrap = await this.scrapProvider.getPage(routeToscrap, browser);

            // Recuperamos los links a la pagina de las tools en futurpedia de la ruta especificada
            const links = await page_to_scrap.$$eval("div.items-start", (resultItems) => {
                const urls = [];
                resultItems.map(async resultItem => {
                    const url = resultItem.querySelector('a').href;
                    if(!urls.includes(url)) urls.push(url);
                });
                return urls;
            });

            response.push(...links);
            await browser.close();
        }

        return response;
    }
}