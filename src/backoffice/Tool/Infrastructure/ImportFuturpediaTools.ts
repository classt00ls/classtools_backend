// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { EventEmitter2 } from       "@nestjs/event-emitter";

// import { ToolRepository } from      "@Shared/Domain/Repository/tool.repository";
// import { TagRepository } from       "@Shared/Domain/Repository/tag.repository";
// import { ToolCreatedEvent } from    "@Shared/Domain/Event/Tool/ToolCreatedEvent";
// import { TagModel } from            "@Shared/Domain/Model/Tag/Tag.model";
// import { PuppeterScrapping } from   "@Shared/Infrastructure/Import/puppeteer/PuppeterScrapping";

// import { GetToolTitle } from        "@Backoffice/Tool/Domain/Futurpedia/GetToolFuturpediaTitle";
// import { GetToolTags } from         "@Backoffice/Tool/Domain/GetToolTags";
// import { GetToolPricing } from      "@Backoffice/Tool/Domain/GetToolPricing";
// import { GetToolStars } from        "@Backoffice/Tool/Domain/GetToolStars";
// import { GetToolFeatures } from     "@Backoffice/Tool/Domain/GetToolFeatures";
// import { GetToolDescription } from  "@Backoffice/Tool/Domain/GetToolDescription";

// import { v4 as uuidv4, v6 as uuidv6 } from 'uuid';

// // Implementacio de ToolCreator
// // @TODO Ahora mismo aquí es donde se hace todo, intentar llevar lógica al dominio

// @Injectable()
// export class ImportFuturpediaTools extends PuppeterScrapping {

//     constructor(
//         private toolRepository: ToolRepository,
//         private eventEmitter: EventEmitter2,
//         private tagRepository: TagRepository
//     ) {
//         super();
//     }

//     async create(url: string) {

//         let page = '';
    
//         for(let i of [1,2,3,4,5,6]) {
    
//           page = i==1 ? '' : '?page='+i;  
    
//           const routeToscrap = url + page; 

//           let page_to_scrap = await this.getPage(routeToscrap);
 
//         // Recuperamos los links a la pagina de las tools en futurpedia de la ruta especificada
//         const links = await page_to_scrap.$$eval("div.items-start", (resultItems) => {
//             const urls = [];
//             resultItems.map(async resultItem => {
//                 const url = resultItem.querySelector('a').href;
//                 if(!urls.includes(url)) urls.push(url);
//             });
//             return urls;
//         })

//         await this.browser.close();

    
//           for (let link of links) {

//             await this.importFromLink(link);

//           }
//         }
//     }

//     private async importFromLink(link: string) {
//         let tool;

//         try {
//             await this.toolRepository.getOneByLinkAndFail(link);
//         } catch (error) {
//             console.log('Ja el tenim ...  continuem.')
//             return;
//         }

//         let page = await this.getPage(link);

//         try {
//             const title = await GetToolTitle.execute(page);
            
//             try {
//                 await this.toolRepository.getOneByNameAndFail(title);
//             } catch(error) {
//                 await this.browser.close();
//                 return;
//             }

//             const tags = await GetToolTags.execute(page);
//             const pricing = await GetToolPricing.execute(page);
//             const features = await GetToolFeatures.execute(page);
//             const stars = await GetToolStars.execute(page); 
//             const description = await GetToolDescription.execute(page);
            
//             const url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
//             const excerpt = await page.$eval('p.my-2', desc => desc.innerText);
            
//             const allTagsToAdd: TagModel[] = await this.getAllTagsToAddAndSaveNew(tags);
            
//             tool = await this.toolRepository.create(
//                 {
//                     id: uuidv6(),
//                     name: title,
//                     excerpt,
//                     link:link,
//                     url,
//                     pricing,
//                     description,
//                     features,
//                     stars
//                 }
//             );

//             tool.tags = allTagsToAdd;

//             const toolSaved = await this.toolRepository.save(tool);

//             this.eventEmitter.emit(
//                 'backoffice.tool.created',
//                 new ToolCreatedEvent(
//                     toolSaved.id,
//                     toolSaved.name,
//                     tags
//                 ),
//             );
//         } catch (error) {
//             console.log('error al scrapejar: ', error);
//         }
//         await this.browser.close();
//     }


//     private async getAllTagsToAddAndSaveNew(tags) {
//         const allTagsToAdd = [];
                
//             for(let tag of tags) {
//                 let new_tag;
//                 // Evitem els duplicats
//                 try {
//                     // Quan existeix el tag pasem al catch i no el creem
//                     await this.tagRepository.getOneByNameAndFail(tag);

//                     new_tag = await this.tagRepository.create(
//                         {
//                             id: uuidv6(),
//                             name: tag
//                         }
//                     );

//                     await this.tagRepository.insert(new_tag);
                    
//                 } catch (error) {
//                     new_tag = await this.tagRepository.getOneByNameOrFail(tag);
//                 }

//                 allTagsToAdd.push(new_tag);
//             }

//             return allTagsToAdd;
//     }
// }