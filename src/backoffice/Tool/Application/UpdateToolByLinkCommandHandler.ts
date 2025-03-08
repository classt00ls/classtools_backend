import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateToolByLinkCommand } from "./UpdateToolByLinkCommand";
import { UpdateToolInterface } from "@Backoffice//Tool/Domain/UpdateToolInterface";
import { ToolParamsExtractor } from "../Domain/ToolParamsExtractor";

@CommandHandler(UpdateToolByLinkCommand)
@Injectable()
export class UpdateToolByLinkCommandHandler implements ICommandHandler<UpdateToolByLinkCommand>{
    constructor(
        @Inject('UpdateToolInterface') private readonly updateTool: UpdateToolInterface,
        @Inject('ToolParamsExtractor') private readonly paramsExtractor: ToolParamsExtractor
    ) {}

    async execute(command: UpdateToolByLinkCommand) {
        try {
            const tool = await this.updateTool.execute(command.link);
            
            // Extraer pros, contras y video
            const { analysis, structuredData } = await this.paramsExtractor.extractProsAndCons(tool.html);
            const videoUrl = await this.paramsExtractor.extractVideoUrl(tool.html);

            // TODO: Actualizar el tool con los nuevos parámetros
            // Aquí necesitaremos acceso al repositorio para guardar los cambios

            return tool;
        } catch (error) {
            console.log(error)
            console.log('importTool error.', command.link)
            return;
        }
    }
}