# Guía sobre Embeddings y Búsquedas Vectoriales

## 1: Embeddings con PGVector

### ¿Qué implica asignar metadata a un Document?

Cuando creamos un documento con:

```typescript
return new Document({
    id: courseId,
    pageContent: content,
    metadata: { url }, // Aquí asignamos metadata
});
```

Este campo `metadata` representa **información contextual** o adicional sobre el documento que:

1. Se almacena junto con el documento en la base de datos
2. **NO se incorpora en el embedding vectorial**
3. Sirve como datos útiles para filtrar o enriquecer resultados

### Relación con PGVectorStore y búsquedas vectoriales

Respecto a las búsquedas vectoriales y metadatos:

1. **¿La búsqueda vectorial tendrá en cuenta esa metadata?**
   - **No para la similitud vectorial**: El cálculo de similitud (distancia coseno) se hace ÚNICAMENTE con el embedding generado del `pageContent`
   - **Sí para filtrado**: Puedes usar la metadata para filtrar resultados DESPUÉS de la búsqueda vectorial

2. **¿No se tendrá en cuenta al hacer el embedding?**
   - Correcto. Los embeddings se generan EXCLUSIVAMENTE del contenido en `pageContent`
   - La metadata no afecta la representación vectorial del documento

3. **¿Se tendrá en cuenta toda la metadata que le ponga?**
   - Toda la metadata será almacenada en la columna "metadata" (como JSON)
   - Podrás recuperarla cuando obtengas resultados de búsqueda
   - Podrás filtrar por cualquier campo de metadata

### Ejemplo práctico

Cuando realizas una búsqueda como:

```typescript
const results = await vectorStore.similaritySearch("consultas asíncronas en JavaScript", 5, {
  url: "http://localhost:3012/asincronia-en-javascript.html" // Filtro por metadata
});
```

El proceso es:
1. Se genera el embedding para la consulta "consultas asíncronas en JavaScript"
2. Se buscan los 5 documentos más similares usando la distancia coseno entre embeddings
3. De esos resultados, se filtran para mostrar solo los que tienen la URL específica

La metadata te permite crear búsquedas híbridas: **similitud semántica + filtrado por atributos exactos**.

### Metadatos adicionales útiles

Podrías enriquecer la metadata con más información como:
- Fecha de creación del curso
- Autor/es
- Categorías o etiquetas
- Nivel de dificultad
- Duración total

Esta información no "contaminaría" la calidad de los embeddings, pero añadiría poderosas capacidades de filtrado a tus búsquedas.

### Configuración en PGVectorStore

En la configuración de PGVectorStore:

```typescript
columns: {
    idColumnName: "id", // Columna para el identificador único del documento
    contentColumnName: "content", // Columna para el contenido textual
    metadataColumnName: "metadata", // Columna para metadatos adicionales (JSON)
    vectorColumnName: "embedding", // Columna para el vector numérico
},
```

El parámetro `metadataColumnName` especifica la columna donde se almacenarán todos los metadatos como un objeto JSON. Esto permite:

1. **Flexibilidad**: Puedes añadir cualquier estructura de metadatos sin cambiar el esquema de la base de datos
2. **Consultas avanzadas**: PostgreSQL permite consultas JSON para filtrar por campos específicos de metadata
3. **Organización**: Mantener separado el contenido principal (que genera embeddings) de los metadatos auxiliares

Cuando realizas una recuperación de documentos, los metadatos se recuperan automáticamente junto con el contenido, lo que facilita operaciones post-procesamiento basadas en atributos específicos del documento. 

## 2: Implementaciones

Existen diferentes enfoques para implementar embeddings en nuestro código, cada uno con sus ventajas según el contexto. Aquí analizamos los tres patrones principales:

### Tres patrones de implementación

1. **Enfoque de alto nivel (scripts utilitarios)**
   ```typescript
   // Ejemplo en scrape-courses.ts
   await vectorStore.addDocuments(documents);
   ```
   - **Ventajas**: Máxima simplicidad, código mínimo
   - **Desventajas**: Menor control sobre el proceso
   - **Uso recomendado**: Procesamiento por lotes, scripts de utilidad, prototipado

2. **Enfoque intermedio (listeners de eventos)**
   ```typescript
   // Ejemplo en ToolCreatedListener
   await vectorStore.addVectors(
     await vectorStore.embeddings.embedDocuments([document.pageContent]),
     [document],
     { ids: [event.aggregate_id] }
   );
   ```
   - **Ventajas**: Control sobre IDs, pasos separados, más flexibilidad
   - **Desventajas**: Más código, menor abstracción
   - **Uso recomendado**: Eventos del sistema, casos con requisitos específicos

3. **Enfoque manual (repositorios de producción)**
   ```typescript
   // Ejemplo en PostgreToolVectorRepository
   const embedding = await this.generateToolVectorDocumentEmbedding(ToolVectorPrimitives);
   await this.execute`INSERT INTO... (embedding) VALUES (${embedding})`;
   ```
   - **Ventajas**: Control total, optimizaciones SQL, máxima flexibilidad
   - **Desventajas**: Mayor complejidad, más código
   - **Uso recomendado**: Aplicaciones de producción, arquitecturas DDD, rendimiento crítico

### Aspectos clave a considerar

#### 1. El campo pageContent es siempre obligatorio

En todos los enfoques, `pageContent` es el único campo obligatorio al crear un `Document` y el único usado para generar embeddings:

```typescript
// Creación mínima válida de un Document
const document = new Document({
    pageContent: "Este es el contenido para embeddings",
});
```

#### 2. Gestión de IDs entre enfoques

- **Enfoque de alto nivel**: El ID se asigna directamente al documento
  ```typescript
  new Document({ id: courseId, pageContent: content });
  ```

- **Enfoque intermedio**: El ID se pasa como parámetro en `addVectors`
  ```typescript
  vectorStore.addVectors(embeddings, [document], { ids: [myId] });
  ```

#### 3. Configuración de columnas en base de datos

La configuración `contentColumnName` solo especifica el nombre de la columna en la base de datos donde se guardará el contenido:

```typescript
// En diferentes implementaciones podemos usar distintos nombres de columna
contentColumnName: "content",  // En scrape-courses.ts
contentColumnName: "description",  // En ToolCreatedListener
```

Esto no afecta la fuente de datos para el embedding, que sigue siendo `document.pageContent`.

### Recomendaciones para tu proyecto

1. **Para scripts y tareas automatizadas**: Usa el enfoque de alto nivel
2. **Para eventos del sistema**: Usa el enfoque intermedio con control de IDs
3. **Para componentes críticos de la aplicación**: Usa el enfoque manual

Cada patrón tiene su lugar en una arquitectura bien diseñada, dependiendo de los requisitos específicos de cada componente.

