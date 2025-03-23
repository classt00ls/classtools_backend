/* eslint-disable no-console */
import { NestFactory } from '@nestjs/core';
import { CommandBus } from '@nestjs/cqrs';
import { EmbeddingModule } from '../../embedding.module';
import { GetEmbeddingResponseCommand } from '../respond/GetEmbeddingResponseCommand';
import { EmbeddingResponseOptions } from '../../Domain/EmbeddingResponseService';

/**
 * Script de ejemplo para usar el sistema RAG de embeddings.
 * 
 * Uso básico: 
 * ```
 * ts-node embedding-rag-example.ts "¿Qué son los embeddings vectoriales?"
 * ```
 * 
 * Con filtros de metadatos:
 * ```
 * ts-node embedding-rag-example.ts "¿Mejores prácticas?" --filter='{"type":"guide","tags":["best-practices"]}'
 * ```
 * 
 * Con prompt personalizado:
 * ```
 * ts-node embedding-rag-example.ts "Técnicas avanzadas de RAG" --prompt="Eres un profesor de IA especializado en LLMs. Explica los conceptos de manera clara con ejemplos prácticos."
 * ```
 * 
 * Combinando varias opciones:
 * ```
 * ts-node embedding-rag-example.ts "Optimización de embeddings" --filter='{"category":"advanced"}' --limit=10 --temp=0.3 --prompt="Eres un experto técnico. Sé preciso y detallado en tus explicaciones."
 * ```
 */

async function main() {
  // Obtener la consulta desde los argumentos de la línea de comandos
  const args = process.argv.slice(2);
  const query = args[0];
  
  if (!query) {
    console.log('Uso: ts-node embedding-rag-example.ts "Tu consulta aquí"');
    console.log('Opciones:');
    console.log('  --filter=\'{"type":"guide"}\' : Filtro de metadatos (formato JSON)');
    console.log('  --limit=10 : Número máximo de documentos a recuperar');
    console.log('  --temp=0.7 : Temperatura del modelo (0.0-1.0)');
    console.log('  --prompt="texto..." : Prompt de sistema personalizado');
    console.log('\nEjemplos de prompts personalizados:');
    console.log('  --prompt="Eres un experto técnico. Proporciona respuestas detalladas y precisas."');
    console.log('  --prompt="Eres un asistente conciso. Limita tus respuestas a 3-5 oraciones."');
    console.log('  --prompt="Explica los conceptos como si le hablaras a un principiante, con analogías sencillas."');
    return;
  }
  
  // Parsear opciones adicionales
  const options: EmbeddingResponseOptions = {};
  
  // Buscar argumentos de opciones
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--filter=')) {
      try {
        options.metadataFilter = JSON.parse(arg.substring('--filter='.length));
      } catch (e) {
        console.error('Error al parsear el filtro. Debe ser un JSON válido.');
        return;
      }
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.substring('--limit='.length), 10);
    } else if (arg.startsWith('--temp=')) {
      options.temperature = parseFloat(arg.substring('--temp='.length));
    } else if (arg.startsWith('--prompt=')) {
      options.systemPrompt = arg.substring('--prompt='.length);
    }
  }
  
  console.log(`Ejecutando consulta: "${query}"`);
  if (options.metadataFilter) {
    console.log(`Con filtro de metadatos: ${JSON.stringify(options.metadataFilter)}`);
  }
  if (options.systemPrompt) {
    console.log(`Con prompt personalizado: "${options.systemPrompt.substring(0, 50)}${options.systemPrompt.length > 50 ? '...' : ''}"`);
  }
  
  // Inicializar la aplicación NestJS
  const app = await NestFactory.createApplicationContext(EmbeddingModule);
  
  try {
    // Obtener el CommandBus
    const commandBus = app.get(CommandBus);
    
    // Ejecutar el comando para obtener la respuesta del embedding
    const response = await commandBus.execute(
      new GetEmbeddingResponseCommand(query, options)
    );
    
    // Mostrar los resultados
    console.log('\n--- Respuesta ---');
    console.log(response.content);
    console.log('\n--- Metadatos ---');
    console.log(`Modelo: ${response.metadata.model || 'No especificado'}`);
    console.log(`Documentos fuente: ${response.metadata.sourceDocuments?.length || 0}`);
    
    // Mostrar información sobre los documentos fuente si están disponibles
    if (response.metadata.sourceDocuments?.length > 0) {
      console.log('\n--- Documentos fuente ---');
      response.metadata.sourceDocuments.forEach((doc, index) => {
        console.log(`\nDocumento #${index + 1}:`);
        console.log(`Contenido: ${doc.pageContent.substring(0, 100)}...`);
        console.log(`Metadatos: ${JSON.stringify(doc.metadata)}`);
      });
    }
  } catch (error) {
    console.error('Error al procesar la consulta:', error);
  } finally {
    await app.close();
  }
}

main().catch(console.error); 