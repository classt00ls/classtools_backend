import { Injectable } from "@nestjs/common";

import { GetToolFuturpediaTitle } from        "@Backoffice/Tool/Domain/Futurpedia/GetToolFuturpediaTitle";
import { GetToolTags } from         "@Backoffice/Tool/Domain/GetToolTags";
import { GetToolPricing } from      "@Backoffice/Tool/Domain/GetToolPricing";
import { GetToolStars } from        "@Backoffice/Tool/Domain/GetToolStars";
import { GetToolFeatures } from     "@Backoffice/Tool/Domain/GetToolFeatures";
import { GetToolDescription } from  "@Backoffice/Tool/Domain/GetToolDescription";

import { ScrapConnectionProvider } from "@Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { ScrapToolResponse } from "../Domain/ScrapResponse";

// Implementacio de ToolCreator
// @TODO Ahora mismo aquí es donde se hace todo, intentar llevar lógica al dominio

@Injectable()
export class ScrapToolFromFuturpedia {

    constructor(
        private scrapProvider: ScrapConnectionProvider
    ) {  }

    public async scrap(link: string) {
        let page;
        try {
            page = await this.scrapProvider.getPage(link);
        } catch (error) {
            console.log('Falla el crap provider');
        }

        try {
            const title = await GetToolFuturpediaTitle.execute(page);
            const tags = await GetToolTags.execute(page);
            const pricing = await GetToolPricing.execute(page);
            const features = await GetToolFeatures.execute(page);
            const stars = await GetToolStars.execute(page); 
            const description = await GetToolDescription.execute(page);
            
            const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
            const excerpt = await page.$eval('p.my-2', desc => desc.innerText);

            const body_content = await page.$eval(
                'div.mx-auto.mt-4.grid.max-w-7xl.grid-cols-1.gap-8.px-4.md\\:grid-cols-\\[3fr_1fr\\].xl\\:px-0',
                (element) => element.innerHTML
              );
            
              const video_content = await page.$eval(
                '.react-player.aspect-video.max-w-full.rounded-lg.shadow-lg', // Usando clases como selector
                (element) => element.innerHTML
              );

            await this.scrapProvider.closeBrowser();
            
            return new ScrapToolResponse(
                title,
                pricing,
                stars,
                description,
                excerpt,
                tags,
                link,
                url,
                features,
                body_content,
                video_content
            )
            
        } catch (error) {
            console.log('error al scrapejar: ', error);
        }
        
    }
}