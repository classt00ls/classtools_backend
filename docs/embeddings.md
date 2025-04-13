# Sistema de Embeddings

Este documento explica el sistema de embeddings implementado en el proyecto, incluyendo su arquitectura, endpoints disponibles, y cómo trabajar con ellos.

## ¿Qué son los Embeddings?

Los embeddings son representaciones vectoriales de datos textuales que capturan su significado semántico. En nuestro proyecto, utilizamos embeddings para:

- Buscar texto similar semánticamente
- Responder consultas con RAG (Retrieval Augmented Generation)
- Almacenar y recuperar conocimiento semántico

## Arquitectura

El sistema de embeddings sigue una arquitectura hexagonal (puertos y adaptadores) con:

- **Dominio**: Entidades y reglas del negocio
- **Aplicación**: Casos de uso y comandos
- **Infraestructura**: Implementaciones concretas

### Componentes principales

1. `Embedding`: Entidad principal que representa un embedding
2. `EmbeddingRepository`: Interfaz para persistencia de embeddings
3. `EmbeddingResponseService`: Interfaz para el servicio de respuestas RAG
4. `PGVectorEmbeddingRepository`: Implementación basada en PostgreSQL con pgvector
5. `OllamaEmbeddingResponseService`: Implementación basada en Ollama para generar respuestas

## Implementación Técnica

### PGVectorStore

El proyecto utiliza `PGVectorStore` de LangChain como base para almacenar y consultar embeddings. Este componente requiere dos elementos fundamentales:

1. **Embedding Generator**: Un servicio que convierte texto en vectores numéricos (embeddings)
2. **Conexión a base de datos PostgreSQL**: Con la extensión PGVector habilitada

#### Embedding Generator

Para generar embeddings, utilizamos un patrón factory que permite flexibilidad según el entorno:

```typescript
// EmbeddingsProviderFactory
static create(configService: ConfigService): Embeddings {
  // Implementación híbrida que selecciona el proveedor basado en configuración
  const provider = determineProvider(configService);
  
  switch (provider) {
    case 'openai':
      return new OpenAIEmbeddings({
        openAIApiKey: configService.get<string>('OPENAI_API_KEY'),
        modelName: configService.get<string>('OPENAI_EMBEDDINGS_MODEL', 'text-embedding-ada-002'),
      });
    case 'ollama':
    default:
      return new OllamaEmbeddings({
        model: configService.get<string>('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text'),
        baseUrl: configService.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434'),
      });
  }
}
```

Este factory nos permite:
- Usar Ollama localmente para desarrollo (más económico y privado)
- Usar OpenAI en producción (más preciso)
- Cambiar fácilmente entre proveedores mediante variables de entorno

#### Conexión a PostgreSQL con PGVector

Para almacenar embeddings, necesitamos:

1. **Extensión PGVector**: Se habilita en la base de datos con:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Inicialización de PGVectorStore**:
   ```typescript
   // Dentro de PGVectorEmbeddingRepository
   private async initializeFromExistingConnection() {
     // Obtener configuración de tablas y columnas
     const tableName = this.getConfigOrDefault('PGVECTOR_TABLE', 'embeddings');
     // Otras configuraciones...
     
     // Crear PGVectorStore con la conexión existente
     this.vectorStore = await PGVectorStore.initialize(
       this.embeddingsGenerator,
       {
         postgresConnectionOptions: {
           type: 'postgres',
           host: dbConfig.host,
           port: dbConfig.port,
           user: dbConfig.username,
           password: dbConfig.password,
           database: dbConfig.database,
           ssl: dbConfig.ssl || false,
         },
         tableName: tableName,
         columns: {
           idColumnName: idColumnName,
           contentColumnName: contentColumnName,
           metadataColumnName: metadataColumnName,
           vectorColumnName: vectorColumnName,
         },
         distanceStrategy: 'cosine' as DistanceStrategy,
       }
     );
   }
   ```

### Optimización de conexiones

Nuestra implementación utiliza un enfoque de **reutilización de conexión** para optimizar recursos:

1. El repositorio puede recibir una conexión existente (`DataSource`) a través del constructor
2. Si existe conexión, la reutiliza para PGVectorStore
3. Si no existe, crea una nueva conexión basada en variables de entorno

Este enfoque evita la duplicación de conexiones y mejora la eficiencia del sistema.

## Endpoints disponibles

### 1. Búsqueda y consulta RAG

**Endpoint**: `POST /api/embeddings/query`

**Descripción**: Realiza una consulta RAG (Retrieval Augmented Generation) sobre los embeddings almacenados.

**Payload**:
```json
{
  "query": "¿Qué son los embeddings?",
  "options": {
    "limit": 5,
    "temperature": 0.7,
    "metadataFilter": { "category": "documentation" },
    "systemPrompt": "Eres un experto técnico...",
    "llmQuery": "Explica detalladamente qué son los embeddings"
  }
}
```

**Respuesta**:
```json
{
  "content": "Los embeddings son representaciones vectoriales...",
  "metadata": {
    "model": "mistral:latest",
    "timestamp": "2023-11-24T12:34:56Z",
    "sourceDocuments": [...],
    "processingTimeMs": 234,
    "searchQuery": "¿Qué son los embeddings?",
    "llmQuery": "Explica detalladamente qué son los embeddings"
  }
}
```

### 2. Creación de embeddings

La creación de embeddings se realiza principalmente mediante comandos internos y no está expuesta como endpoint público.

**Proceso interno**: Se utiliza `CreateEmbeddingCommand` procesado por `CreateEmbeddingCommandHandler` que llama a `EmbeddingCreator`.

## Creación y gestión de embeddings

### Creación de embeddings

Para crear embeddings, se utiliza el patrón CQRS mediante comandos:

```typescript
// Ejemplo de código para crear un embedding
commandBus.execute(
  new CreateEmbeddingCommand(
    "id-único",
    "Contenido textual que será convertido a embedding",
    { 
      category: "documentation",
      tags: ["embeddings", "vector-db"],
      source: "manual"
    }
  )
);
```

El proceso interno:
1. El comando es recibido por `CreateEmbeddingCommandHandler`
2. Se invoca `EmbeddingCreator.run()`
3. Se crea una instancia de `Embedding` y se guarda mediante `EmbeddingRepository`
4. `PGVectorEmbeddingRepository` convierte el texto a vector usando el embedding generator
5. PGVectorStore almacena el vector y metadatos en la base de datos PostgreSQL

### Actualización de embeddings

```typescript
// Ejemplo de actualización de contenido
commandBus.execute(
  new UpdateEmbeddingCommand(
    "id-existente",
    "Nuevo contenido textual actualizado"
  )
);

// Ejemplo de actualización de metadatos
embeddingMetadataUpdater.run({
  id: "id-existente",
  metadata: { 
    category: "updated-category",
    version: 2
  }
});
```

### Eliminación de embeddings

```typescript
embeddingDeleter.run("id-a-eliminar");
```

## Búsqueda de embeddings

El repositorio proporciona varios métodos de búsqueda:

1. **Búsqueda por similitud semántica**:
   ```typescript
   const resultados = await embeddingRepository.search(
     "consulta en lenguaje natural",
     5,  // límite de resultados
     { category: "documentation" }  // filtro de metadatos opcional
   );
   ```

2. **Búsqueda por ID similar**:
   ```typescript
   const similares = await embeddingRepository.searchSimilar(
     "id-referencia",
     10  // límite de resultados
   );
   ```

## Personalización de consultas RAG

El sistema permite personalizar las consultas RAG mediante varias opciones:

- **limit**: Número de documentos a recuperar (default: 5)
- **temperature**: Temperatura para la generación de texto (default: 0.7)
- **metadataFilter**: Filtro para metadatos de los embeddings
- **systemPrompt**: Instrucciones personalizadas para el modelo
- **llmQuery**: Consulta específica para el LLM

## Implementación

El proyecto utiliza:

- **PGVector**: Extensión de PostgreSQL para almacenamiento eficiente de vectores
- **Ollama**: Servicio para generar embeddings y respuestas LLM
- **LangChain**: Framework para construir aplicaciones con LLMs

## Variables de entorno

Para configurar el sistema de embeddings, se utilizan las siguientes variables:

**Generales:**
- `USE_MOCK_EMBEDDINGS`: Si es "true", utiliza una implementación mock para pruebas
- `EMBEDDINGS_PROVIDER`: Proveedor a utilizar ("ollama", "openai" o "auto")

**Conexión a PostgreSQL:**
- `PGVECTOR_HOST`: Host de PostgreSQL (default: "localhost")
- `PGVECTOR_PORT`: Puerto (default: "5432")
- `PGVECTOR_USER`: Usuario
- `PGVECTOR_PASSWORD`: Contraseña
- `PGVECTOR_DB`: Nombre de la base de datos
- `PGVECTOR_SSL`: Usar SSL (default: "false")

**Configuración de tablas:**
- `PGVECTOR_TABLE`: Nombre de la tabla (default: "embeddings")
- `PGVECTOR_COL_ID`: Columna de ID (default: "id")
- `PGVECTOR_COL_CONTENT`: Columna de contenido (default: "content")
- `PGVECTOR_COL_METADATA`: Columna de metadatos (default: "metadata")
- `PGVECTOR_COL_VECTOR`: Columna de vectores (default: "embedding")

**Ollama:**
- `OLLAMA_BASE_URL`: URL base de Ollama (default: "http://localhost:11434")
- `OLLAMA_EMBEDDINGS_MODEL`: Modelo para embeddings (default: "nomic-embed-text")
- `OLLAMA_LLM_MODEL`: Modelo para respuestas (default: "mistral:latest")

**OpenAI (si se utiliza):**
- `OPENAI_API_KEY`: API key de OpenAI
- `OPENAI_EMBEDDINGS_MODEL`: Modelo para embeddings (default: "text-embedding-ada-002")

## Ejemplos de uso

### Consulta básica
```typescript
const respuesta = await embeddingResponseService.respond("¿Qué son los embeddings?");
```

### Consulta con filtrado por metadatos
```typescript
const respuesta = await embeddingResponseService.respond(
  "Mejores prácticas para embeddings",
  {
    metadataFilter: { 
      category: "best-practices",
      tags: { "$in": ["embeddings", "optimization"] }
    }
  }
);
```

### Consulta con prompt personalizado
```typescript
const respuesta = await embeddingResponseService.respond(
  "Vectores en PostgreSQL",
  {
    systemPrompt: "Eres un experto en bases de datos vectoriales. Proporciona respuestas técnicas detalladas con ejemplos de código.",
    temperature: 0.3
  }
);
```

## Consideraciones y mejores prácticas

1. **Metadatos útiles**: Añade metadatos descriptivos a tus embeddings para facilitar el filtrado
2. **Contenido de calidad**: El contenido de los embeddings debe ser claro y conciso
3. **Normalización de texto**: El sistema normaliza automáticamente el texto al crear embeddings
4. **Optimización de consultas**: Usa `llmQuery` diferente de `searchQuery` para optimizar las respuestas
5. **systemPrompt personalizado**: Adapta el systemPrompt según el tipo de respuesta deseada 