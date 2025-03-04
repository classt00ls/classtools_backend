import { Injectable } from "@nestjs/common";
import { TagRepository } from       "@Shared/Domain/Repository/tag.repository";
import { TagModel } from            "@Shared/Domain/Model/Tag/Tag.model";

import { GetToolFuturpediaTitle } from        "src/backoffice/Tool/Domain/Futurpedia/GetToolFuturpediaTitle";
import { GetToolTags } from         "src/backoffice/Tool/Domain/GetToolTags";
import { GetToolPricing } from      "src/backoffice/Tool/Domain/GetToolPricing";
import { GetToolStars } from        "src/backoffice/Tool/Domain/GetToolStars";
import { GetToolFeatures } from     "src/backoffice/Tool/Domain/GetToolFeatures";
import { GetToolDescription } from  "src/backoffice/Tool/Domain/GetToolDescription";

import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';
import { ScrapConnectionProvider } from "@Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { ToolModel } from "../Domain/tool.model";

// Implementacio de ToolCreator
// @TODO Ahora mismo aquí es donde se hace todo, intentar llevar lógica al dominio

@Injectable()
export class ImportFuturpediaTool {

    constructor(
        private tagRepository: TagRepository,
        private scrapProvider: ScrapConnectionProvider
    ) {  }

    public async import(link: string) {
    
        let tool;

        let page = await this.scrapProvider.getPage(link);

        try {
            const title = await GetToolFuturpediaTitle.execute(page);
            const tags = await GetToolTags.execute(page);
            const pricing = await GetToolPricing.execute(page);
            const features = await GetToolFeatures.execute(page);
            const stars = await GetToolStars.execute(page); 
            const description = await GetToolDescription.execute(page);
            
            const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
            const excerpt = await page.$eval('p.my-2', desc => desc.innerText);

            const bodyContent = await page.$eval(
                'div.mx-auto.mt-4.grid.max-w-7xl.grid-cols-1.gap-8.px-4.md\\:grid-cols-\\[3fr_1fr\\].xl\\:px-0',
                (element) => element.innerHTML
              );
            
              const video_content = await page.$eval(
                '.react-player.aspect-video.max-w-full.rounded-lg.shadow-lg', // Usando clases como selector
                (element) => element.innerHTML
              );

            const allTagsToAdd: TagModel[] = await this.getAllTagsToAddAndSaveNew(tags);

            await this.scrapProvider.closeBrowser();
            
            // @TODO esto es una guarrada, lo de los tags pff ...
            return ToolModel.fromPrimitives(
                uuidv6(),
                title,
                pricing,
                stars,
                description,
                features,
                excerpt,
                allTagsToAdd,
                link,
                url,
                bodyContent,
                video_content
            )
            
        } catch (error) {
            console.log('error al scrapejar: ', error);
        }
        
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
                            id: uuidv6(),
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