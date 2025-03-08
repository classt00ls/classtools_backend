import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateToolByLinkCommand } from "./UpdateToolByLinkCommand";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolParamsExtractor } from "../Domain/ToolParamsExtractor";
import { ToolUpdater } from "../Domain/ToolUpdater";
import { ToolParams } from "../Domain/ToolCreator";

@CommandHandler(UpdateToolByLinkCommand)
@Injectable()
export class UpdateToolByLinkCommandHandler implements ICommandHandler<UpdateToolByLinkCommand>{
    private readonly logger = new Logger(UpdateToolByLinkCommandHandler.name);

    constructor(
        private toolRepository: ToolRepository,
        private updater: ToolUpdater,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor,
    ) {}

    async execute(command: UpdateToolByLinkCommand) {
        try {
            this.logger.log(`Iniciando actualización de tool con link: ${command.link}`);

            // Recuperar la herramienta por su link
            const tool = await this.toolRepository.getOneByLinkOrFail(command.link);
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

            const toolParams: ToolParams = {
                // Mantenemos los campos existentes del tool
                title: tool.name,
                link: tool.link,
                url: tool.url,
                pricing: tool.pricing,
                stars: tool.stars,
                body_content: tool.html,
                video_content: tool.video_html,
                tags: tool.tags.map(t => t.name),
                // Actualizamos con el nuevo contenido extraído
                description: descriptionResult,
                excerpt: excerptResult,
                features: featuresResult,
                prosAndCons: prosAndConsResponse,
                ratings: ratingsResponse,
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