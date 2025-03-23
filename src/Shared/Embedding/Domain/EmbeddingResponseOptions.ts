/**
 * Opciones para personalizar las consultas de embedding
 */
export interface EmbeddingResponseOptions {
  /**
   * Número máximo de documentos a recuperar.
   * Por defecto: 5
   */
  limit?: number;
  
  /**
   * Filtro para los metadatos de los embeddings.
   * 
   * Permite filtrar los embeddings basándose en sus metadatos.
   * La estructura exacta depende de los metadatos almacenados
   * en tus embeddings y del soporte de filtrado de tu almacén 
   * vectorial.
   * 
   * Ejemplos de filtros:
   * 
   * - Filtro básico por un campo exacto:
   *   ```
   *   { type: "article" }
   *   ```
   * 
   * - Filtro con operadores como $eq, $gt, $lt:
   *   ```
   *   { 
   *     "createdAt": { "$gt": "2023-01-01" },
   *     "category": { "$eq": "documentation" }
   *   }
   *   ```
   * 
   * - Filtro con arrays usando $in:
   *   ```
   *   { "tags": { "$in": ["vector-db", "embeddings"] } }
   *   ```
   */
  metadataFilter?: Record<string, any>;
  
  /**
   * Temperatura del modelo para la generación de texto.
   * Valores más altos (0.7-1.0) generan respuestas más creativas.
   * Valores más bajos (0.0-0.3) generan respuestas más deterministas.
   * Por defecto: 0.7
   */
  temperature?: number;
  
  /**
   * Instrucciones de sistema personalizadas para el modelo.
   * Permite ajustar el comportamiento del modelo para la tarea específica.
   * 
   * Ejemplos de systemPrompt:
   * 
   * - Para respuestas técnicas detalladas:
   *   ```
   *   "Eres un experto técnico en embeddings y bases de datos vectoriales. 
   *   Proporciona respuestas detalladas y técnicamente precisas, citando 
   *   conceptos específicos cuando sea relevante. Incluye ejemplos concretos 
   *   de implementación cuando sea posible."
   *   ```
   * 
   * - Para respuestas concisas:
   *   ```
   *   "Eres un asistente eficiente. Proporciona respuestas breves, 
   *   precisas y directas. Limita tu respuesta a 3-5 oraciones como máximo. 
   *   Enfócate sólo en los puntos más importantes."
   *   ```
   * 
   * - Para respuestas orientadas a principiantes:
   *   ```
   *   "Eres un tutor paciente especializado en explicar conceptos complejos 
   *   de manera sencilla. Utiliza analogías y ejemplos cotidianos para 
   *   explicar conceptos técnicos. Evita la jerga técnica innecesaria y 
   *   define cualquier término especializado que necesites usar."
   *   ```
   * 
   * - Para respuestas en formato estructurado:
   *   ```
   *   "Eres un asistente que organiza información. Proporciona tus respuestas 
   *   en formato de lista numerada, con una breve introducción al principio y 
   *   una conclusión al final. Divide la información en categorías lógicas."
   *   ```
   * 
   * - Para análisis crítico:
   *   ```
   *   "Eres un analista crítico. Para cada concepto o afirmación mencionada 
   *   en el contexto, presenta tanto sus fortalezas como sus limitaciones. 
   *   Ofrece perspectivas alternativas y menciona casos donde podrían aplicarse 
   *   enfoques diferentes."
   *   ```
   * 
   * - Para extracción de información específica:
   *   ```
   *   "Eres un asistente especializado en extraer información específica. 
   *   Analiza el contexto proporcionado y extrae únicamente los datos, 
   *   métricas, fechas y nombres relevantes a la consulta. Presenta la 
   *   información en formato de tabla o lista concisa."
   *   ```
   */
  systemPrompt?: string;
  
  /**
   * Consulta específica para el LLM, que puede ser diferente de la consulta 
   * utilizada para la búsqueda de embeddings.
   * 
   * Esto permite optimizar el proceso RAG en dos niveles:
   * 1. La query principal (searchQuery) se usa para encontrar documentos relevantes,
   *    pudiendo contener términos técnicos y palabras clave específicas
   * 2. Esta llmQuery se usa para formular la pregunta final al modelo LLM,
   *    pudiendo ser más detallada o incluir instrucciones específicas
   * 
   * Si no se proporciona, se utilizará la query de búsqueda original.
   * 
   * Ejemplos de uso:
   * 
   * - Búsqueda técnica + pregunta específica:
   *   ```
   *   searchQuery: "pgvector postgresql implementación índices ivfflat"
   *   llmQuery: "Explica paso a paso cómo implementar y optimizar índices IVFFlat en pgvector"
   *   ```
   * 
   * - Términos de búsqueda + solicitud explicativa:
   *   ```
   *   searchQuery: "RAG langchain retrieval augmented generation cosine similarity"
   *   llmQuery: "Explica en términos sencillos qué es RAG y cómo funciona"
   *   ```
   */
  llmQuery?: string;
} 