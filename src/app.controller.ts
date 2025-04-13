import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
}
