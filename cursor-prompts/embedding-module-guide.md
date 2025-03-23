# Módulo de Embedding: Guía de Referencia Rápida

## Visión General
El módulo de Embedding proporciona capacidades de búsqueda semántica y generación de respuestas basadas en recuperación aumentada (RAG) para la aplicación. Permite almacenar, indexar y consultar contenido textual utilizando embeddings vectoriales.

## Estructura del Módulo
- **Domain**: Define los modelos de dominio, interfaces y servicios abstractos
- **Application**: Implementa los casos de uso mediante comandos y manejadores (CQRS)
- **Infrastructure**: Proporciona implementaciones concretas y adaptadores para servicios externos

## Capacidades Principales

### 1. Almacenamiento de Embeddings
- Persistencia de contenido textual junto con metadatos estructurados
- Generación automática de vectores de embedding para búsqueda semántica
- Integración con PGVectorStore para almacenamiento de vectores eficiente

### 2. Búsqueda Semántica
- Búsqueda por similitud semántica en el contenido vectorizado
- Filtrado por metadatos para refinar resultados
- Opciones de limitación y paginación de resultados

### 3. Generación de Respuestas (RAG)
- Recuperación de documentos relevantes basados en consultas en lenguaje natural
- Generación de respuestas contextuales utilizando modelos LLM (Ollama)
- Personalización de respuestas mediante prompts de sistema

## API y Puntos de Acceso

### Consultas mediante API REST
Endpoint: `POST /api/embeddings/query`
```json
{
  "query": "¿Qué son los embeddings vectoriales?",
  "options": {
    "limit": 10,
    "temperature": 0.7,
    "metadataFilter": { "type": "technical" },
    "systemPrompt": "Eres un experto técnico..."
  }
}
```

### Acceso Programático (CQRS)
```typescript
// Obtener respuesta usando CommandBus
const response = await commandBus.execute(
  new GetEmbeddingResponseCommand(query, options)
);
```

## Opciones de Personalización

### 1. Filtrado por Metadatos (`metadataFilter`)
Permite filtrar resultados basados en sus metadatos:

```typescript
// Filtro básico por campo exacto
{ type: "article" }

// Filtro con operadores
{ 
  "createdAt": { "$gt": "2023-01-01" },
  "category": { "$eq": "documentation" } 
}

// Filtro con arrays 
{ "tags": { "$in": ["vector-db", "embeddings"] } }
```

### 2. Instrucciones de Sistema (`systemPrompt`)
Personaliza el comportamiento del modelo para diferentes tipos de respuestas:

```typescript
// Para respuestas técnicas detalladas
"Eres un experto técnico en embeddings y bases de datos vectoriales. 
Proporciona respuestas detalladas y técnicamente precisas, citando 
conceptos específicos cuando sea relevante."

// Para respuestas concisas
"Eres un asistente eficiente. Proporciona respuestas breves, 
precisas y directas. Limita tu respuesta a 3-5 oraciones como máximo."

// Para principiantes
"Eres un tutor paciente especializado en explicar conceptos complejos 
de manera sencilla. Utiliza analogías y evita la jerga técnica."
```

### 3. Otras Opciones
- `limit`: Número máximo de documentos a recuperar (default: 5)
- `temperature`: Controla la creatividad del modelo (0.0-1.0, default: 0.7)

## Ejemplos de Uso

### Ejemplo 1: Consulta básica
```typescript
const response = await embeddingResponseService.respond(
  "¿Qué son los embeddings vectoriales?"
);
```

### Ejemplo 2: Consulta con filtros y personalización
```typescript
const response = await embeddingResponseService.respond(
  "Técnicas avanzadas de RAG", 
  {
    limit: 10,
    temperature: 0.3,
    metadataFilter: { 
      category: "advanced", 
      tags: { $in: ["rag", "langchain"] } 
    },
    systemPrompt: "Eres un profesor universitario explicando conceptos avanzados de IA."
  }
);
```

### Ejemplo 3: Uso desde línea de comandos
```bash
ts-node embedding-rag-example.ts "¿Mejores prácticas?" --filter='{"type":"guide"}' --limit=10 --temp=0.3 --prompt="Eres un experto técnico."
```

## Integración con el Resto de la Aplicación

El módulo de Embedding se integra con el resto de la aplicación a través del patrón CQRS:

1. Los controladores envían comandos al bus de comandos
2. Los manejadores de comandos procesan las solicitudes
3. Los servicios de dominio implementan la lógica específica
4. Los repositorios proporcionan acceso a los datos persistentes

Para extender el módulo, se pueden implementar nuevos manejadores de comandos y consultas, o ampliar los servicios existentes. 

## Programación de Agentes de IA con el Módulo de Embedding

El módulo de Embedding proporciona una base sólida para desarrollar agentes de IA avanzados. A continuación se exploran diferentes formas de aprovechar este módulo para potenciar agentes inteligentes.

### 1. Agentes con Memoria de Largo Plazo

Los agentes pueden utilizar el módulo de Embedding para implementar una "memoria" persistente:

```typescript
// Guardar interacciones importantes en el repositorio de embeddings
await embeddingRepository.save({
  id: generarId(),
  content: "El usuario prefiere explicaciones técnicas detalladas sobre conceptos de ML",
  metadata: {
    type: "user_preference",
    userId: "user123",
    category: "communication_style",
    timestamp: new Date()
  }
});

// Recuperar contexto relevante antes de responder
const relevantMemories = await embeddingRepository.search(
  "preferencias de comunicación del usuario",
  5,
  { userId: "user123" }
);
```

### 2. Agentes Expertos en Dominios Específicos

Configurar agentes especializados en diferentes dominios mediante filtros de metadatos:

```typescript
// Agente especializado en programación
const programmingResponse = await embeddingResponseService.respond(
  userQuery,
  {
    metadataFilter: { domain: "programming" },
    systemPrompt: "Eres un experto en programación. Proporciona ejemplos de código claros y explicaciones paso a paso."
  }
);

// Agente especializado en marketing
const marketingResponse = await embeddingResponseService.respond(
  userQuery,
  {
    metadataFilter: { domain: "marketing" },
    systemPrompt: "Eres un consultor de marketing digital. Enfócate en estrategias actuales y métricas relevantes."
  }
);
```

### 3. Agentes con Toma de Decisiones Basada en Contexto

Los agentes pueden usar RAG para tomar decisiones más informadas:

```typescript
// El agente recopila contexto antes de decidir cómo proceder
const context = await embeddingRepository.search(
  "precedentes para esta situación de soporte técnico",
  10,
  { type: "support_case", severity: "high" }
);

// Determina el curso de acción basado en casos similares
if (context.length > 0) {
  // Analiza los casos encontrados y decide
  const decision = await analyzeContextAndDecide(context, currentCase);
  return decision;
} else {
  // Sin precedentes, sigue el protocolo estándar
  return standardProtocol(currentCase);
}
```

### 4. Agentes Multi-etapa con Búsqueda Progresiva

Implementar agentes que refinan progresivamente sus búsquedas:

```typescript
// Etapa 1: Búsqueda general para comprender el tema
const generalContext = await embeddingRepository.search(query, 3);

// Etapa 2: Extracción de términos clave
const extractedTerms = await extractKeyTerms(query, generalContext);

// Etapa 3: Búsqueda específica con términos refinados
const specificContext = await embeddingRepository.search(
  extractedTerms.join(" "),
  5,
  { confidence: { $gt: 0.8 } }
);

// Etapa 4: Generación de respuesta con contexto enriquecido
return generateEnhancedResponse(query, [...generalContext, ...specificContext]);
```

### 5. Agentes Colaborativos

Varios agentes pueden trabajar juntos utilizando el mismo repositorio de embeddings:

```typescript
// Agente 1: Investigador - Recopila información
const researchResults = await researchAgent.findRelevantInfo(topic);
await storeFindings(researchResults); // Guarda en repositorio de embeddings

// Agente 2: Analista - Analiza la información recopilada
const analysis = await analysisAgent.analyzeContent(topic);

// Agente 3: Redactor - Genera el contenido final
const finalContent = await contentAgent.createContent(topic, analysis);
```

### 6. Optimizaciones para Agentes

Para mejorar el rendimiento de agentes basados en embedding:

1. **Cacheo inteligente**:
   ```typescript
   // Cachear resultados frecuentes para reducir latencia
   const cacheKey = `${query}_${JSON.stringify(options)}`;
   if (cache.has(cacheKey)) return cache.get(cacheKey);
   
   const result = await embeddingResponseService.respond(query, options);
   cache.set(cacheKey, result, TTL);
   return result;
   ```

2. **Retroalimentación para mejorar respuestas**:
   ```typescript
   // Almacenar feedback del usuario para mejorar respuestas futuras
   await embeddingRepository.save({
     content: generatedResponse,
     metadata: {
       query: originalQuery,
       userFeedback: feedbackScore,
       wasHelpful: feedbackScore > 3
     }
   });
   ```

3. **Personalización adaptativa**:
   ```typescript
   // Ajustar parámetros basados en retroalimentación previa
   const userHistory = await getUserResponseHistory(userId);
   const optimalTemperature = calculateOptimalTemperature(userHistory);
   
   return embeddingResponseService.respond(query, {
     temperature: optimalTemperature,
     // Otros parámetros adaptados dinámicamente
   });
   ```

Estas técnicas permiten crear agentes de IA sofisticados que combinan el poder de los modelos de lenguaje con conocimiento contextual específico, memoria de largo plazo y capacidades de razonamiento mejoradas mediante RAG. 

## Integración con Eventos de Dominio

El módulo de Embedding está diseñado para integrarse fácilmente con la arquitectura de eventos de dominio, permitiendo la generación automática de embeddings cuando ocurren eventos relevantes en el sistema.

### Escuchando Eventos de Dominio

Para indexar automáticamente contenido cuando se crean o actualizan entidades, puedes crear listeners de eventos que utilicen el `EmbeddingRepository`:

```typescript
@EventListener('backoffice.tool.created')
@Injectable()
export class ToolCreatedListener {
    private readonly logger = new Logger(ToolCreatedListener.name);

    constructor(
        @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository
    ) {}
    
    async handle(event: Event) {
        try {
            // 1. Crear contenido estructurado a partir del evento
            const content = this.createContent(event);
            
            // 2. Definir metadatos relevantes para la búsqueda
            const metadata = this.createMetadata(event);

            // 3. Crear una instancia de Embedding
            const embedding = Embedding.create(
                event.aggregate_id,
                content,
                metadata
            );

            // 4. Persistir el embedding
            await this.embeddingRepository.save(embedding);
        } catch (error) {
            this.logger.error(`Error processing event: ${error.message}`);
            throw error;
        }
    }
    
    private createContent(event: Event): string {
        // Crear contenido estructurado para optimizar la búsqueda semántica
        return `
Nombre: ${event.event_data.name}
Descripción: ${event.event_data.description}
// Otros campos relevantes...
`.trim();
    }

    private createMetadata(event: Event): Record<string, any> {
        return {
            source: 'tool',
            type: 'tool',
            name: event.event_data.name,
            tags: event.event_data.tags || [],
            // Otros campos para filtrado...
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}
```

### Configuración del Módulo

Para utilizar el `EmbeddingRepository` en un listener de eventos, asegúrate de:

1. Importar el `EmbeddingModule` en el módulo donde se define el listener:

```typescript
@Module({
    imports: [
        // Otros imports...
        EmbeddingModule
    ],
    providers: [
        // Otros providers...
        ToolCreatedListener
    ]
})
export class ToolModule {}
```

2. Inyectar el `EmbeddingRepository` usando el token de inyección de dependencias:

```typescript
constructor(
    @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository
) {}
```

### Mejores Prácticas para Eventos

1. **Estructura del contenido**: Organiza el contenido de manera estructurada para facilitar la recuperación semántica.
2. **Metadatos relevantes**: Incluye todos los metadatos que puedan ser útiles para filtrar resultados.
3. **Manejo de errores**: Implementa estrategias de reintento o compensación para eventos fallidos.
4. **Idempotencia**: Asegúrate de que el proceso sea idempotente para evitar duplicados si el evento se procesa más de una vez.
5. **Consistencia eventual**: Recuerda que existe un pequeño retraso entre la creación de la entidad y su disponibilidad para consultas. 

## Exportación e Inyección de Dependencias

El módulo de Embedding expone sus servicios a través de tokens de inyección de dependencias. Para utilizarlos correctamente en otros módulos, es importante entender cómo están configurados y exportados.

### Servicios Exportados

El `EmbeddingModule` exporta los siguientes servicios:

```typescript
@Module({
  // ...
  exports: [
    CqrsModule,
    'EmbeddingRepository',
    'EmbeddingResponseService'
  ]
})
export class EmbeddingModule {}
```

### Configuración en Módulos Consumidores

Para utilizar el módulo de Embedding en otro módulo, sigue estos pasos:

1. **Importa el módulo**:

```typescript
@Module({
  imports: [
    // Otros imports...
    EmbeddingModule
  ],
  // ...
})
export class TuModulo {}
```

2. **Inyecta los servicios usando el decorador `@Inject`**:

```typescript
@Injectable()
export class TuServicio {
  constructor(
    @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository,
    @Inject('EmbeddingResponseService') private readonly embeddingResponseService: EmbeddingResponseService
  ) {}
  
  // Tu lógica aquí...
}
```

### Resolución de Problemas Comunes

Si encuentras errores como:

```
Error: Nest can't resolve dependencies of the [TuServicio] (?). 
Please make sure that the argument "EmbeddingRepository" at index [0] is available in the [TuModulo] context.
```

Verifica:

1. Que has importado correctamente el `EmbeddingModule` en tu módulo.
2. Que estás usando el token de inyección exacto: `'EmbeddingRepository'` (como string).
3. Que no estás redefiniendo el mismo token en tu módulo, lo que podría causar conflictos.

Si necesitas personalizar la implementación del repositorio o servicio para un módulo específico, puedes redefinir el proveedor en ese módulo:

```typescript
@Module({
  imports: [
    // No importes EmbeddingModule si vas a redefinir todos sus servicios
  ],
  providers: [
    {
      provide: 'EmbeddingRepository',
      useClass: TuImplementacionDelRepositorio,
    },
  ],
})
export class TuModuloPersonalizado {}
```

## Migración de Componentes Existentes

### Migración de ToolVectorSearcher

El `ToolVectorSearcher` es un componente que originalmente utilizaba directamente `OllamaEmbeddings` para generar embeddings y buscar herramientas similares. A continuación se muestra cómo migrarlo para aprovechar el nuevo módulo de Embedding:

#### Implementación Original

```typescript
// Implementación original usando OllamaEmbeddings directamente
@Injectable()
export class ToolVectorSearcher {
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private readonly dataSource: DataSource,
        private readonly toolVectorRepository: ToolVectorRepository
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }
    
    async search(
        prompt: string,
        lang: string = 'es'
    ) {
        try {
            const result = await this.toolVectorRepository.search(prompt);
            
            const repository = this.getRepositoryForLanguage(lang);
            const response = await Promise.all(result.map(item => this.format(item, repository))); 
            return response;
            
        } catch(error) {
            console.error('[ToolVectorRepository] Error en búsqueda vectorial:', error);
            throw error;
        }
    }

    // Otros métodos...
}
```

#### Implementación Migrada al Módulo de Embedding

```typescript
@Injectable()
export class ToolVectorSearcher {
    private repositories: { [key: string]: ToolRepository } = {};

    constructor(
        private readonly dataSource: DataSource,
        // Inyectamos el EmbeddingRepository del nuevo módulo
        @Inject('EmbeddingRepository') private readonly embeddingRepository: EmbeddingRepository
    ) {
        // Inicializar repositorios para los idiomas principales
        this.repositories = {
            es: new ToolTypeormRepository(dataSource, '_es'),
            en: new ToolTypeormRepository(dataSource, '_en')
        };
    }
    
    async search(
        prompt: string,
        lang: string = 'es'
    ) {
        try {
            // Usamos el EmbeddingRepository para buscar contenido similar
            const embeddings = await this.embeddingRepository.search(
                prompt, 
                10, // Límite de resultados
                { type: 'tool' } // Filtro por metadatos para asegurar que solo devuelve herramientas
            );
            
            // Extraemos los IDs de los resultados
            const toolIds = embeddings.map(embedding => embedding.metadata.aggregateId || embedding.id);
            
            // Obtenemos la información completa de las herramientas desde el repositorio específico del idioma
            const repository = this.getRepositoryForLanguage(lang);
            const response = await Promise.all(
                toolIds.map(id => repository.getOne(id))
            );
            
            // Filtramos posibles valores nulos (herramientas que pudieran no existir)
            return response.filter(tool => tool !== null);
            
        } catch(error) {
            console.error('[ToolVectorSearcher] Error en búsqueda de embeddings:', error);
            throw error;
        }
    }

    private getRepositoryForLanguage(lang: string): ToolRepository {
        const cleanLang = lang.replace(/['"]/g, '').trim();
        
        if (!this.repositories[cleanLang]) {
            this.repositories[cleanLang] = new ToolTypeormRepository(this.dataSource, `_${cleanLang}`);
        }
        return this.repositories[cleanLang];
    }

    // Otros métodos si son necesarios...
}
```

### Beneficios de la Migración

1. **Simplificación**: No necesitas gestionar directamente la generación de embeddings ni las consultas vectoriales.
2. **Mantenibilidad**: El código de búsqueda vectorial está centralizado en el módulo de Embedding.
3. **Flexibilidad**: Puedes aprovechar todas las características del módulo, como el filtrado por metadatos.
4. **Consistencia**: Todos los componentes de la aplicación utilizan la misma lógica para búsquedas semánticas.

### Consideraciones para la Migración

1. **Metadatos**: Asegúrate de que las herramientas indexadas en el repositorio de embeddings tengan los metadatos adecuados (`type: 'tool'`, `aggregateId`, etc.).

2. **Evento de Indexación**: Implementa un evento para indexar herramientas en el repositorio de embeddings, como se muestra en la sección "Integración con Eventos de Dominio".

3. **Búsqueda Avanzada**: Si necesitas funcionalidades más avanzadas, puedes utilizar el `EmbeddingResponseService` para obtener respuestas generadas por LLM basadas en las herramientas recuperadas:

```typescript
@Injectable()
export class ToolRAGService {
    constructor(
        @Inject('EmbeddingResponseService') 
        private readonly embeddingResponseService: EmbeddingResponseService
    ) {}
    
    async getToolRecommendations(userQuery: string): Promise<EmbeddingResponse> {
        return await this.embeddingResponseService.respond(
            userQuery,
            {
                metadataFilter: { type: 'tool' },
                systemPrompt: "Eres un experto en herramientas tecnológicas. Recomienda las herramientas más adecuadas basadas en la consulta del usuario y explica por qué son apropiadas para su caso de uso."
            }
        );
    }
}
``` 