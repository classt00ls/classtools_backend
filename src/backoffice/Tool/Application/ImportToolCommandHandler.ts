import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportToolInterface } from "@Backoffice//Tool/Domain/ImportToolInterface";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ToolCreatedEvent } from "@Shared/Domain/Event/Tool/ToolCreatedEvent";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ImportToolCommand } from "@Backoffice/Tool/Application/ImportToolCommand";


@CommandHandler(ImportToolCommand)
@Injectable()
export class ImportToolByLinkCommandHandler implements ICommandHandler<ImportToolCommand>{
    constructor(
        @Inject('ImportToolInterface') private readonly importTool: ImportToolInterface,
        private toolRepository: ToolRepository,
        private eventEmitter: EventEmitter2
    ) {}

    async execute(command: ImportToolCommand) {

        try {
            await this.toolRepository.getOneByLinkAndFail(command.link);
        } catch (error) {
            console.log('Ja el tenim ... <'+command.link+'>  continuem.')
            // return;
        }

        const tool = await this.importTool.import(command.link);

// console.log(' --- ',tool.toPrimitives())

        // tool = await this.toolRepository.create(
        //     {
        //         id: uuidv6(),
        //         name: title, 
        //         excerpt,
        //         link:link,
        //         url,
        //         pricing,
        //         description,
        //         features,
        //         stars,
        //         html
        //     }
        // );
    

        // const toolSaved = await this.toolRepository.save(tool);

        this.eventEmitter.emit(
            'backoffice.tool.created',
            new ToolCreatedEvent(
                tool.id,
                tool.name,
                tool.getTagsPrimitivesAsString(),
                tool.description,
                tool.price,
                tool.url,
                tool.html,
                tool.video_html
            ),
        );

    }
}