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
import { ToolCreatedEvent } from "../Domain/ToolCreatedEvent";

@CommandHandler(ImportToolCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolCommand>{
    private readonly logger = new Logger(ImportToolByLinkCommandHandler.name);

    constructor(
        @Inject('ScrapTool') private readonly scrapTool: ScrapTool,
        private toolRepository: ToolRepository,
        private creator: ToolCreator,
        private tagCreator: TagCreator,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor,
        private eventEmitter: EventEmitter2
    ) {
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

    async execute(command: ImportToolCommand) {
        try {
            // A este nivel el link donde escrapeamos es el identificador único
            await this.toolRepository.getOneByLinkAndFail(command.link);
        } catch (error) {
            this.logger.log(`Tool con link ${command.link} ya existe, continuando con el proceso...`);
        }
        
        const tool = await this.scrapTool.scrap(command.link);

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

        // Obtener la respuesta del scraping
        const scrapResponse = await this.scrapTool.scrap(command.link);

        // Crear los tags
        const tags = await this.tagCreator.extract(scrapResponse.tags);

        const toolParams: ToolParams = {
            ...scrapResponse,
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

        const tools = await this.creator.create(toolParams, tags);

        // Emitir evento para cada herramienta creada
        for (const tool of tools) {
            await this.eventEmitter.emit(
                'tool.created',
                new ToolCreatedEvent(
                    tool.id,
                    tool.name,
                    tool.tags.map(t => t.name).join("\n"),
                    tool.description,
                    tool.pricing,
                    tool.url,
                    tool.html,
                    tool.video_html,
                    tool.video_url,
                    tool.prosAndCons,
                    tool.ratings
                )
            );
        }
    }
}