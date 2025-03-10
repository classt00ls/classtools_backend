import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProcessEventsCommand } from './Shared/Infrastructure/Event/process-events.command';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const command = app.get(ProcessEventsCommand);
  
  try {
    await command.execute();
  } catch (error) {
    console.error('Error procesando eventos:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap(); 