import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CommandBus } from '@nestjs/cqrs';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly commandBus?: CommandBus
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Endpoint de prueba para verificar rutas en Railway
  @Get('test-railway')
  testRailway(): string {
    return 'La API está funcionando correctamente en Railway';
  }
  
  // Endpoint de prueba para consumir eventos
  @Post('test-events-consume')
  async testEventsConsume(
    @Body('type') type: string,
    @Body('limit') limit: number
  ): Promise<any> {
    return {
      message: 'Endpoint de prueba para consumir eventos',
      received: { type, limit },
      timestamp: new Date().toISOString()
    };
  }

  // Endpoint GET para consumir eventos (como alternativa al POST)
  @Get('events-consume')
  async getEventsConsume(
    @Query('type') type: string,
    @Query('limit') limit: number
  ): Promise<any> {
    try {
      // Si tenemos CommandBus disponible, intentamos ejecutar el comando
      if (this.commandBus) {
        // Importamos dinámicamente para evitar errores si la clase no está disponible
        const { ConsumeEventCommand } = await import('@Events/Event/Application/Command/ConsumeEventCommand');
        
        await this.commandBus.execute(
          new ConsumeEventCommand(
            type,
            limit || 10
          )
        );
        
        return {
          success: true,
          message: 'Eventos procesados correctamente',
          params: { type, limit }
        };
      } else {
        // Si no tenemos CommandBus, simplemente devolvemos los parámetros
        return {
          success: false,
          message: 'CommandBus no disponible',
          params: { type, limit }
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error al procesar eventos',
        error: error.message,
        params: { type, limit }
      };
    }
  }
}
