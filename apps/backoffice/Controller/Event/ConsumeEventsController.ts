import { ConsumeEventCommand } from '@Events/Event/Application/Command/ConsumeEventCommand';
import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('events')
@ApiTags('Events')
export class ConsumeEventsController {
    private readonly logger = new Logger(ConsumeEventsController.name);

    constructor(
        private readonly commandBus: CommandBus
    ) {}

    @Post('/consume')
    @ApiOperation({ summary: 'Consume un evento del sistema' })
    @ApiResponse({ 
        status: 201, 
        description: 'El evento ha sido consumido correctamente' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Datos del evento inválidos' 
    })
    async consume(
        @Body('type') type: string
    ): Promise<void> {
    
        await this.commandBus.execute(
            new ConsumeEventCommand(
                type
            )
        );
    }
} 