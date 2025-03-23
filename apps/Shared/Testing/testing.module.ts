import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestingController } from './testing.controller';
import { EmbeddingModule } from '@Shared/Embedding/embedding.module';

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
    
    // Importamos el módulo de Embedding que contiene todas las funcionalidades de RAG
    EmbeddingModule,
  ],
  controllers: [
    // Controlador para exponer endpoints de prueba
    TestingController,
  ],
  providers: [
    // Aquí puedes añadir tus propios servicios, comandos y handlers
  ],
})
export class TestingModule {} 