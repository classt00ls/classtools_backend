import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ScrapTool } from "@Backoffice/Tool/Domain/ScrapTool";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ImportToolCommand } from "@Backoffice/Tool/Application/ImportToolCommand";
import { ToolCreator } from "../Domain/ToolCreator";
import { TagCreator } from "@Backoffice/Tag/Domain/TagCreator";
import { ToolParamsExtractor } from "../Domain/ToolParamsExtractor";

@CommandHandler(ImportToolCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolCommand>{
    private readonly logger = new Logger(ImportToolByLinkCommandHandler.name);

    constructor(
        @Inject('ScrapTool') private readonly scrapTool: ScrapTool,
        private toolRepository: ToolRepository,
        private creator: ToolCreator,
        private tagCreator: TagCreator,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor
    ) {}

    async execute(command: ImportToolCommand) {
        try {
            // A este nivel el link donde escrapeamos es el identificador único
            await this.toolRepository.getOneByLinkAndFail(command.link);
        } catch (error) {
            this.logger.log(`Tool con link ${command.link} ya existe, continuando con el proceso...`);
        }
        
        const tool = await this.scrapTool.scrap(command.link);

        // Valores por defecto en caso de que fallen las extracciones
        let prosAndConsAnalysis = '';
        let videoUrl = 'No video found';
        let ratingsAnalysis = '';
        let descriptionAnalysis = '';
        let excerptAnalysis = '';

        // Extraer descripción del contenido principal
        try {
            const descriptionResult = await this.paramsExtractor.extractDescription(tool.body_content);
            
        } catch (error) {
            this.logger.warn(`Error al extraer descripción para ${command.link}: ${error.message}`);
            descriptionAnalysis = '';
        }

        // Extraer resumen del contenido principal
        try {
            const excerptResult = await this.paramsExtractor.extractExcerpt(tool.body_content);
            
            this.logger.debug('Resumen extraído correctamente');
        } catch (error) {
            this.logger.warn(`Error al extraer resumen para ${command.link}: ${error.message}`);
            excerptAnalysis = '';
        }

        // Extraer pros y contras del contenido principal
        try {
            const prosAndConsResponse = await this.paramsExtractor.extractProsAndCons(tool.body_content);
            
        } catch (error) {
            this.logger.warn(`Error al extraer pros y contras para ${command.link}: ${error.message}`);
            prosAndConsAnalysis = '';
        }
        
        // Extraer video del contenido específico de video
        try {
            videoUrl = await this.paramsExtractor.extractVideoUrl(tool.video_content);
            this.logger.debug(`URL del video extraída: ${videoUrl}`);
        } catch (error) {
            this.logger.warn(`Error al extraer URL del video para ${command.link}: ${error.message}`);
            videoUrl = 'No video found';
        }

        // Extraer ratings del contenido principal
        try {
            const ratingsResponse = await this.paramsExtractor.extractRatings(tool.body_content);
            
            
        } catch (error) {
            this.logger.warn(`Error al extraer ratings para ${command.link}: ${error.message}`);
            ratingsAnalysis = '';
        }

        // Añadir los parámetros extraídos al objeto que se pasará al creator
        const toolWithParams = {
            ...tool,
            description: descriptionAnalysis,
            excerpt: excerptAnalysis,
            prosAndCons: prosAndConsAnalysis,
            videoUrl: videoUrl,
            ratings: ratingsAnalysis
        };

        try {
            const tags_created = await this.tagCreator.extract(tool.tags);

            await this.creator.create(toolWithParams, tags_created);
            
            this.logger.log(`Tool ${command.link} creada exitosamente con todos sus parámetros`);
        } catch (error) {
            this.logger.error(`Error al crear la tool ${command.link}: ${error.message}`);
            throw error; // Este error sí lo propagamos ya que es crítico
        }
    }
}