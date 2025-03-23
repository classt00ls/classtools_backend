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