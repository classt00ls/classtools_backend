import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ScrapTool } from "@Backoffice/Tool/Domain/ScrapTool";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ImportToolCommand } from "@Backoffice/Tool/Application/ImportToolCommand";
import { ToolCreator } from "../Domain/ToolCreator";
import { TagCreator } from "@Backoffice/Tag/Domain/TagCreator";
import { ToolParamsExtractor } from "../Domain/ToolParamsExtractor";
import { ToolParams } from "../Domain/ToolCreator";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ScrapConnectionProvider } from "@Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";
import { ScrapToolLinks } from "../Domain/ScrapToolLinks";
@CommandHandler(ImportToolCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolCommand>{
    private readonly logger = new Logger(ImportToolByLinkCommandHandler.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        @Inject('ScrapTool') private readonly scrapTool: ScrapTool,
        @Inject('ScrapToolLinks') private readonly scrapToolLinks: ScrapToolLinks,
        private dataSource: DataSource,
        private creator: ToolCreator,
        private tagCreator: TagCreator,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor,
        private eventEmitter: EventEmitter2,
        private scrapProvider: ScrapConnectionProvider
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }

    private getRepositoryForLanguage(lang: string): ToolRepository {
        if (!this.repositories[lang]) {
            this.repositories[lang] = new ToolTypeormRepository(this.dataSource, `_${lang}`);
        }
        return this.repositories[lang];
    }

    async execute(command: ImportToolCommand) {
        const browser = await this.scrapProvider.getConnection();
        const routeToscrap = command.link;
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

        if (links.length === 0) {
            this.logger.warn('No se encontraron herramientas para importar');
            await browser.close();
            return;
        }

        this.logger.log(`Importando primera herramienta de ${links.length} encontradas`);

        try {
            // Solo tomamos el primer link
            const firstLink = links[4];
            await this.importFromLink(firstLink);
            this.logger.log(`Importación exitosa de la herramienta desde ${firstLink}`);
        } catch (error) {
            this.logger.error(`Error importando herramienta: ${error.message}`);
            throw error;
        } finally {
            await browser.close();
        }
    }

    private async importFromLink(link: string) {
        try {
            // Verificamos si la herramienta ya existe en inglés
            const enRepository = this.getRepositoryForLanguage('en');
            await enRepository.getOneByLinkAndFail(link);
            this.logger.log(`Tool con link ${link} ya existe en inglés, saltando importación...`);
            return;
        } catch (error) {
            // Si no existe en inglés, continuamos con la importación
            this.logger.log(`Tool con link ${link} no existe en inglés, procediendo con la importación...`);
        }
        
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const tool = await this.scrapTool.scrap(link);

                // Extraer y limpiar descripción del contenido principal
                const descriptionResult = await this.paramsExtractor.extractDescription(tool.body_content);
                const cleanDescriptionResult = this.cleanMultiLanguageResponse(descriptionResult);
                    
                // Extraer y limpiar resumen del contenido principal
                const excerptResult = await this.paramsExtractor.extractExcerpt(tool.body_content);
                const cleanExcerptResult = this.cleanMultiLanguageResponse(excerptResult);
                    
                // Extraer y limpiar pros y contras del contenido principal
                const prosAndConsResponse = await this.paramsExtractor.extractProsAndCons(tool.body_content);
                const cleanProsAndConsResponse = this.cleanMultiLanguageResponse(prosAndConsResponse);
                    
                // Extraer y limpiar ratings del contenido principal
                const ratingsResponse = await this.paramsExtractor.extractRatings(tool.body_content);
                const cleanRatingsResponse = this.cleanMultiLanguageResponse(ratingsResponse);

                // Extraer y limpiar features del contenido principal
                const featuresResult = await this.paramsExtractor.extractFeatures(tool.body_content);
                const cleanFeaturesResult = this.cleanMultiLanguageResponse(featuresResult);

                // Extraer y limpiar howToUse del contenido principal
                const howToUseResult = await this.paramsExtractor.extractHowToUse(tool.body_content);
                const cleanHowToUseResult = this.cleanMultiLanguageResponse(howToUseResult);

                // Extraer URL del video si existe
                const videoUrl = await this.paramsExtractor.extractVideoUrl(tool.body_content);

                // Crear los tags
                const tags = await this.tagCreator.extract(tool.tags);

                const toolParams: ToolParams = {
                    ...tool,
                    description: {
                        es: cleanDescriptionResult.es,
                        en: cleanDescriptionResult.en
                    },
                    excerpt: {
                        es: cleanExcerptResult.es,
                        en: cleanExcerptResult.en
                    },
                    features: {
                        es: cleanFeaturesResult.es,
                        en: cleanFeaturesResult.en
                    },
                    prosAndCons: {
                        es: cleanProsAndConsResponse.es,
                        en: cleanProsAndConsResponse.en
                    },
                    ratings: {
                        es: cleanRatingsResponse.es,
                        en: cleanRatingsResponse.en
                    },
                    howToUse: cleanHowToUseResult,
                    videoUrl
                };

                await this.creator.create(toolParams, tags);

                return;

            } catch (error) {
                if (attempt === 2) {
                    this.logger.error(`Failed to import tool ${link} after 2 attempts: ${error.message}`);
                    return;
                }
                this.logger.warn(`Failed attempt ${attempt} for tool ${link}: ${error.message}. Retrying...`);
            }
        }
    }

    private cleanAsterisks(text: string): string {
        if (!text) return text;
        // Eliminar asteriscos al principio de cada línea
        return text.replace(/^\s*\*+\s*/gm, '')
                  // Eliminar asteriscos sueltos en el texto
                  .replace(/\s*\*+\s*/g, ' ')
                  // Eliminar espacios múltiples
                  .replace(/\s+/g, ' ')
                  .trim();
    }

    private cleanMultiLanguageResponse<T extends { analysis: string }>(response: { es: T, en: T }): { es: T, en: T } {
        return {
            es: {
                ...response.es,
                analysis: this.cleanAsterisks(response.es.analysis)
            },
            en: {
                ...response.en,
                analysis: this.cleanAsterisks(response.en.analysis)
            }
        };
    }
}