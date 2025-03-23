# Casos de Uso del Módulo de Embeddings

Este documento describe los diferentes casos de uso que puedes implementar utilizando el módulo de Embeddings en el contexto Shared. El módulo proporciona una serie de comandos y servicios que permiten realizar operaciones con embeddings vectoriales.

Todas las operaciones que modifican el estado de los embeddings generan eventos de dominio que pueden ser utilizados para integraciones y procesamiento asíncrono. Para más información sobre el sistema de eventos, consulta la [documentación de eventos](/src/Events/Shared/events.md).

## 1. Creación de Embeddings

### Comando: `CreateEmbeddingCommand`

Este comando permite crear un nuevo embedding en la base de datos vectorial.

```typescript
// Importación
import { CreateEmbeddingCommand } from '@Shared/Embedding/Application/create/CreateEmbeddingCommand';
import { CommandBus } from '@nestjs/cqrs';

// Inyección de dependencia
constructor(private readonly commandBus: CommandBus) {}

// Uso
await this.commandBus.execute(
  new CreateEmbeddingCommand(
    'id-unico-123', // ID único del embedding
    'Contenido a vectorizar', // Texto que será convertido en un vector
    { // Metadatos opcionales
      type: 'tool', 
      name: 'Herramienta de ejemplo',
      category: 'AI',
      tags: ['vectores', 'búsqueda']
    }
  )
);
```

**Parámetros del comando:**
- `id`: Identificador único del embedding (string).
- `content`: Contenido textual que será vectorizado (string).
- `metadata`: Objeto con metadatos que ayudan a categorizar el embedding (opcional).

**Caso de uso:** Ideal para almacenar información estructurada que luego quieras recuperar mediante búsqueda semántica.

**Eventos generados:** Esta operación genera un evento `embedding.created` que puede ser consumido por otros servicios. Ver [sistema de eventos](/src/Events/Shared/events.md).

## 2. Actualización de Embeddings

### Comando: `UpdateEmbeddingCommand`

Este comando permite actualizar el contenido de un embedding existente.

```typescript
// Importación
import { UpdateEmbeddingCommand } from '@Shared/Embedding/Application/update/UpdateEmbeddingCommand';

// Uso
await this.commandBus.execute(
  new UpdateEmbeddingCommand(
    'id-unico-123', // ID del embedding a actualizar
    'Nuevo contenido actualizado' // Nuevo texto a vectorizar
  )
);
```

**Parámetros del comando:**
- `id`: Identificador del embedding a actualizar (string).
- `content`: Nuevo contenido textual que reemplazará al anterior (string).

**Caso de uso:** Actualizar información que ha cambiado con el tiempo, manteniendo el mismo identificador para referenciarla.

## 3. Actualización de Metadatos de Embeddings

### Servicio: `EmbeddingMetadataUpdater`

Este servicio permite actualizar los metadatos de un embedding sin modificar su contenido vectorial.

```typescript
// Importación
import { EmbeddingMetadataUpdater } from '@Shared/Embedding/Application/update-metadata/EmbeddingMetadataUpdater';

// Inyección de dependencia
constructor(private readonly metadataUpdater: EmbeddingMetadataUpdater) {}

// Uso
await this.metadataUpdater.run({
  id: 'id-unico-123', // ID del embedding a actualizar
  metadata: { // Nuevos metadatos que reemplazarán a los anteriores
    visibility: 'public',
    relevance: 'high',
    updated: true,
    lastUpdated: new Date().toISOString()
  }
});
```

**Parámetros:**
- `id`: Identificador del embedding a actualizar (string).
- `metadata`: Objeto con los nuevos metadatos (Record<string, any>).

**Caso de uso:** Actualizar información auxiliar como etiquetas, categorías o propiedades sin tener que recalcular los vectores.

**Eventos generados:** Esta operación genera un evento `embedding.metadata.modified` que puede ser consumido por otros servicios. Ver [sistema de eventos](/src/Events/Shared/events.md).

## 4. Eliminación de Embeddings

### Servicio: `EmbeddingDeleter`

Este servicio permite eliminar un embedding de la base de datos.

```typescript
// Importación
import { EmbeddingDeleter } from '@Shared/Embedding/Application/delete/EmbeddingDeleter';

// Inyección de dependencia
constructor(private readonly deleter: EmbeddingDeleter) {}

// Uso
await this.deleter.run('id-unico-123'); // ID del embedding a eliminar
```

**Parámetros:**
- `id`: Identificador del embedding a eliminar (string).

**Caso de uso:** Eliminar información obsoleta o que ya no es relevante.

**Eventos generados:** Esta operación genera un evento `embedding.deleted` que puede ser consumido por otros servicios. Ver [sistema de eventos](/src/Events/Shared/events.md).

## 5. Búsqueda de Embeddings

### Servicio: `EmbeddingSearcher`

Este servicio permite buscar embeddings similares a una consulta dada.

```typescript
// Importación
import { EmbeddingSearcher } from '@Shared/Embedding/Application/search/EmbeddingSearcher';

// Inyección de dependencia
constructor(private readonly searcher: EmbeddingSearcher) {}

// Uso básico
const results = await this.searcher.run({
  query: 'inteligencia artificial generativa', // Texto de búsqueda
  limit: 5 // Número máximo de resultados
});

// Uso con filtro de metadatos
const filteredResults = await this.searcher.run({
  query: 'inteligencia artificial generativa',
  limit: 10,
  metadataFilter: {
    type: 'tool', // Solo buscar embeddings de tipo 'tool'
    category: 'AI' // Solo en la categoría 'AI'
  }
});
```

**Parámetros:**
- `query`: Texto de búsqueda (string).
- `limit`: Número máximo de resultados a devolver (number, opcional).
- `metadataFilter`: Filtro de metadatos para limitar la búsqueda (Record<string, any>, opcional).

**Caso de uso:** Encontrar información semánticamente similar a una consulta, útil para sistemas de recomendación o búsqueda.

## 6. Obtención de Respuestas con Embeddings

### Comando: `GetEmbeddingResponseCommand`

Este comando permite generar respuestas basadas en embeddings utilizando RAG (Retrieval Augmented Generation).

```typescript
// Importación
import { GetEmbeddingResponseCommand } from '@Shared/Embedding/Application/respond/GetEmbeddingResponseCommand';

// Uso básico
const response = await this.commandBus.execute(
  new GetEmbeddingResponseCommand(
    '¿Cómo funcionan los embeddings vectoriales?' // Query de búsqueda
  )
);

// Uso avanzado con opciones
const advancedResponse = await this.commandBus.execute(
  new GetEmbeddingResponseCommand(
    '¿Cuáles son las mejores prácticas para crear embeddings?',
    { // Opciones adicionales
      limit: 10, // Cantidad de documentos a recuperar
      temperature: 0.2, // Temperatura para la generación (más baja = más determinista)
      metadataFilter: { // Filtros de metadatos
        category: 'best-practices',
        tags: { "$in": ['embeddings', 'vector-db'] }
      },
      systemPrompt: 'Eres un experto técnico en bases de datos vectoriales. Proporciona respuestas detalladas con ejemplos.'
    }
  )
);
```

**Parámetros del comando:**
- `searchQuery`: Consulta para buscar documentos relevantes (string).
- `options`: Opciones de generación de respuesta (opcional):
  - `limit`: Número de documentos a recuperar.
  - `temperature`: Controla la aleatoriedad de la respuesta.
  - `metadataFilter`: Filtro de metadatos para la búsqueda.
  - `systemPrompt`: Instrucciones para el modelo de lenguaje.

**Caso de uso:** Generar respuestas basadas en conocimiento específico almacenado en embeddings, ideal para chatbots, asistentes virtuales o sistemas de preguntas y respuestas.

## 7. Procesamiento de Embeddings por Lotes

### Servicio: `EmbeddingBatchProcessor`

Este servicio permite crear o eliminar múltiples embeddings en una sola operación.

```typescript
// Importación
import { EmbeddingBatchProcessor } from '@Shared/Embedding/Application/batch/EmbeddingBatchProcessor';

// Inyección de dependencia
constructor(private readonly batchProcessor: EmbeddingBatchProcessor) {}

// Crear múltiples embeddings
await this.batchProcessor.createBatch([
  {
    id: 'herramienta-1',
    content: 'Descripción detallada de la herramienta 1',
    metadata: { type: 'tool', name: 'Herramienta 1' }
  },
  {
    id: 'herramienta-2',
    content: 'Descripción detallada de la herramienta 2',
    metadata: { type: 'tool', name: 'Herramienta 2' }
  },
  // Más embeddings...
]);

// Eliminar múltiples embeddings
await this.batchProcessor.deleteBatch([
  'herramienta-1',
  'herramienta-2',
  // Más IDs...
]);
```

**Parámetros para createBatch:**
- `requests`: Array de objetos con propiedades:
  - `id`: Identificador único del embedding.
  - `content`: Contenido textual a vectorizar.
  - `metadata`: Metadatos opcionales (Record<string, any>).

**Parámetros para deleteBatch:**
- `ids`: Array de identificadores de embeddings a eliminar.

**Caso de uso:** Procesar grandes cantidades de datos en una sola operación, ideal para importación/exportación de datos o migraciones.

**Eventos generados:** Estas operaciones generan múltiples eventos (`embedding.created` o `embedding.deleted`) que pueden ser consumidos por otros servicios. Ver [sistema de eventos](/src/Events/Shared/events.md).

## Acceso mediante API REST

El módulo expone un endpoint REST para consultas basadas en embeddings:

```http
POST /api/embeddings/query
Content-Type: application/json

{
  "query": "¿Qué son los embeddings?",
  "options": {
    "limit": 5,
    "metadataFilter": {
      "type": "article"
    }
  }
}
```

La respuesta incluirá el contenido generado y metadatos asociados:

```json
{
  "content": "Los embeddings son representaciones vectoriales...",
  "metadata": {
    "model": "ollama/mistral",
    "timestamp": "2023-12-20T14:30:00Z",
    "sourceDocuments": [...],
    "searchQuery": "¿Qué son los embeddings?"
  }
}
```

**Caso de uso:** Integración con aplicaciones cliente o servicios externos que necesiten realizar consultas semánticas. 