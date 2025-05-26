import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestingController } from './testing.controller';
import app from '../../../src/Shared/Agents/Infrastructure/tool-recomendator';
import { ToolRepositoryModule } from 'src/backoffice/Tool/Infrastructure/Persistence/TypeOrm/tool.repository.module';

/**
 * Módulo de pruebas para trabajar con el módulo de Embedding
 * 
 * Este módulo proporciona una configuración básica para empezar a trabajar
 * con las funcionalidades de RAG y embeddings.
 */
@Module({
  imports: [
    // Importamos el módulo CQRS para trabajar con comandos y consultas
    CqrsModule,
    ToolRepositoryModule
  ],
  controllers: [
    // Controlador para exponer endpoints de prueba
    TestingController,
  ],
  providers: [
    {
      provide: 'TOOL_RECOMMENDER',
      useValue: app
    }
  ],
})
export class TestingModule {} 