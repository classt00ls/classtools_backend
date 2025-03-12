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
export class ScrapToolFromFuturpedia {
    private readonly logger = new Logger(ScrapToolFromFuturpedia.name);

    constructor(
        private scrapProvider: ScrapConnectionProvider
    ) {  }

    public async scrap(link: string): Promise<ScrapToolResponse> {

        let page, browser;

        try {

            browser = await this.scrapProvider.getConnection();

            page = await this.scrapProvider.getPage(link, browser);

        } catch (error) {
            this.logger.error(`Error al obtener la página ${link}: ${error.message}`);
            throw new Error(`No se pudo obtener la página desde el proveedor de scrap: ${error.message}`);
        }

        try {
            // Valores por defecto
            let title = 'Sin título';
            let tags: string[] = [];
            let pricing = 'No disponible';
            let stars = 0;
            let url = link;
            let body_content, reviews_content, video_content = '';

            // Intentar extraer cada elemento individualmente
            try {
                title = await GetToolFuturpediaTitle.execute(page);
            } catch (error) {
                this.logger.warn(`Error al extraer título para ${link}: ${error.message}`);
            }

            try {
                tags = await GetToolTags.execute(page);
            } catch (error) {
                this.logger.warn(`Error al extraer tags para ${link}: ${error.message}`);
            }

            try {
                pricing = await GetToolPricing.execute(page);
            } catch (error) {
                this.logger.warn(`Error al extraer precio para ${link}: ${error.message}`);
            }

            try {
                stars = await GetToolStars.execute(page);
            } catch (error) {
                this.logger.warn(`Error al extraer estrellas para ${link}: ${error.message}`);
            }

            try {
                url = await page.$eval('div.mt-4.flex.flex-wrap.gap-4 > a', reference => reference.href);
                // Limpiar la URL de parámetros GET
                url = url.split('?')[0];
            } catch (error) {
                this.logger.warn(`Error al extraer URL para ${link}: ${error.message}`);
            }

            try {
                body_content = await page.$eval(
                    'div.mx-auto.mt-4.grid.max-w-7xl.grid-cols-1.gap-8.px-4.md\\:grid-cols-\\[3fr_1fr\\].xl\\:px-0',
                    (element) => element.innerHTML
                );
            } catch (error) {
                this.logger.warn(`Error al extraer contenido principal para ${link}: ${error.message}`);
            }

            try {
                video_content = await page.$eval(
                    '.mx-auto.mb-20.mt-4.grid.w-full.max-w-7xl.grid-cols-1.justify-center.gap-8.px-4.md\\:grid-cols-2.xl\\:px-0',
                    (elemento) => elemento.innerHTML
                );
            } catch (error) {
                this.logger.warn(`Error al extraer contenido de video para ${link}: ${error.message}`);
            }

            try {
                reviews_content = await page.$eval('#tool-reviews', (element) => element.innerHTML);
            } catch (error) {
                this.logger.warn(`Error al extraer contenido de reseñas para ${link}: ${error.message}`);
            }
            const reviews_html = await page.$eval('#tool-reviews', (element) => element.innerHTML);

            await browser.close();
            
            const response = new ScrapToolResponse(
                title,
                pricing,
                stars,
                tags,
                link,
                url,
                body_content,
                video_content,
                reviews_html
            );

            this.logger.log(`Scraping completado exitosamente para ${link}`);
            return response;
            
        } catch (error) {
            this.logger.error(`Error general durante el scraping de ${link}: ${error.message}`);
            await browser.close();
            throw error;
        }
    }
}