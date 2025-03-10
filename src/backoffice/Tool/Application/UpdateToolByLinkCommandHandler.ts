import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateToolByLinkCommand } from "./UpdateToolByLinkCommand";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolParamsExtractor } from "../Domain/ToolParamsExtractor";
import { ToolUpdater } from "../Domain/ToolUpdater";
import { ToolParams } from "../Domain/ToolCreator";
import { DataSource } from "typeorm";
import { ToolTypeormRepository } from "src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.typeorm.repository";

@CommandHandler(UpdateToolByLinkCommand)
@Injectable()
export class UpdateToolByLinkCommandHandler implements ICommandHandler<UpdateToolByLinkCommand>{
    private readonly logger = new Logger(UpdateToolByLinkCommandHandler.name);
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private dataSource: DataSource,
        private updater: ToolUpdater,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor,
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }

    private getRepositoryForLanguage(lang: string): ToolRepository {
        const cleanLang = lang.replace(/['"]/g, '').trim();
        
        if (!this.repositories[cleanLang]) {
            this.repositories[cleanLang] = new ToolTypeormRepository(this.dataSource, `_${cleanLang}`);
        }
        return this.repositories[cleanLang];
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

    async execute(command: UpdateToolByLinkCommand) {
        try {
            this.logger.log(`Iniciando actualización de tool con link: ${command.link}`);

            // Recuperar la herramienta por su link usando el idioma especificado
            const repository = this.getRepositoryForLanguage(command.lang);
            const tool = await repository.getOneByLinkOrFail(command.link);
            this.logger.log(`Tool encontrada: ${tool.name} (${tool.id})`);
            

            // Extraer todos los campos necesarios
            const [
                descriptionResult,
                excerptResult,
                prosAndConsResponse,
                ratingsResponse,
                featuresResult,
                videoUrl
            ] = await Promise.all([
                this.paramsExtractor.extractDescription(tool.html),
                this.paramsExtractor.extractExcerpt(tool.html),
                this.paramsExtractor.extractProsAndCons(tool.html),
                this.paramsExtractor.extractRatings(tool.html),
                this.paramsExtractor.extractFeatures(tool.html),
                this.paramsExtractor.extractVideoUrl(tool.video_html || '')
            ]);

            // Extraer y limpiar howToUse del contenido principal
            const howToUseResult = await this.paramsExtractor.extractHowToUse(tool.html);

            // Limpiar los resultados de asteriscos
            const cleanDescriptionResult = this.cleanMultiLanguageResponse(descriptionResult);
            const cleanExcerptResult = this.cleanMultiLanguageResponse(excerptResult);
            const cleanProsAndConsResponse = this.cleanMultiLanguageResponse(prosAndConsResponse);
            const cleanRatingsResponse = this.cleanMultiLanguageResponse(ratingsResponse);
            const cleanFeaturesResult = this.cleanMultiLanguageResponse(featuresResult);
            const cleanHowToUseResult = this.cleanMultiLanguageResponse(howToUseResult);

            // Verificar si tenemos tags antes de intentar mapearlos
            if (!tool.tags) {
                this.logger.warn(`La herramienta ${tool.name} no tiene tags definidos`);
            } else {
                this.logger.debug(`Tags encontrados: ${JSON.stringify(tool.tags)}`);
            }

            const toolParams: ToolParams = {
                // Mantenemos los campos existentes del tool
                title: tool.name,
                link: tool.link,
                url: tool.url,
                pricing: tool.pricing,
                stars: tool.stars,
                body_content: tool.html,
                video_content: tool.video_html,
                tags: Array.isArray(tool.tags) ? tool.tags.map(t => t.name) : [],
                // Actualizamos con el nuevo contenido extraído y limpio
                description: cleanDescriptionResult,
                excerpt: cleanExcerptResult,
                features: cleanFeaturesResult,
                prosAndCons: cleanProsAndConsResponse,
                ratings: cleanRatingsResponse,
                howToUse: cleanHowToUseResult,
                videoUrl
            };

            this.logger.log('Actualizando versiones de la tool...');
            const tools = await this.updater.update(tool.id, toolParams);

            this.logger.log('Actualización completada exitosamente');
            return tools;

        } catch (error) {
            this.logger.error(`Error al actualizar la tool con link ${command.link}: ${error.message}`);
            this.logger.error('Stack trace:', error.stack);
            throw error;
        }
    }
}