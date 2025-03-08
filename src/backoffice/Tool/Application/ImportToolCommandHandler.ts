import { Inject, Injectable } from "@nestjs/common";
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
            console.log('Ja el tenim ... <'+command.link+'>  continuem.')
            // return;
        }
        
        const tool = await this.scrapTool.scrap(command.link);

        // Extraer pros y contras del contenido principal
        // analysis: contiene el HTML formateado con los pros y contras
        // structuredData: contiene los pros y contras en formato JSON por si necesitamos procesarlos programáticamente
        // (por ejemplo, para búsquedas, filtros, o análisis de datos)
        const { analysis, structuredData } = await this.paramsExtractor.extractProsAndCons(tool.body_content);
        
        // Extraer video del contenido específico de video
        const videoUrl = await this.paramsExtractor.extractVideoUrl(tool.video_content);

        // Añadir los parámetros extraídos al objeto que se pasará al creator
        const toolWithParams = {
            ...tool,
            prosAndCons: analysis,
            videoUrl: videoUrl
        };

        const tags_created = await this.tagCreator.extract(tool.tags);

        await this.creator.create(toolWithParams, tags_created);
    }
} 