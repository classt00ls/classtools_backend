# Migración de Embeddings

Este documento detalla los lugares donde se están usando embeddings actualmente y los pasos necesarios para migrar al nuevo repositorio centralizado.

## Lugares donde se usan embeddings actualmente

### 1. ToolVectorSearcher
**Ubicación**: `src/web/Tool/Application/search/ToolVectorSearcher.ts`
**Uso**: Búsqueda de herramientas similares basada en texto
**Cambios necesarios**:
- Ya está usando el nuevo `EmbeddingRepository` a través de inyección de dependencias
- No requiere cambios adicionales

### 2. PostgreToolVectorRepository
**Ubicación**: `src/web/Tool/Infrastructure/Persistence/Postgre/PostgreToolVectorRepository.ts`
**Uso**: Almacenamiento y búsqueda de vectores de herramientas
**Cambios necesarios**:
- Migrar toda la funcionalidad al nuevo `EmbeddingRepository`
- Actualizar los métodos `search` y `searchSimilarByIds` para usar el nuevo repositorio
- Eliminar la implementación actual una vez migrada

### 3. OllamaLangchainUserToolSuggestionsRepository
**Ubicación**: `src/web/UserToolSuggestions/Infrastructure/OllamaLangchainUserToolSuggestionsRepository.ts`
**Uso**: Generación de sugerencias de herramientas basadas en embeddings
**Cambios necesarios**:
- Ya está usando el nuevo `EmbeddingRepository`
- No requiere cambios adicionales

### 4. Scripts de Utilidad
**Ubicaciones**:
- `apps/Shared/scripts/search-tools.ts`
- `apps/Shared/scripts/search-posts.ts`
- `misc/search-tools.ts`
**Uso**: Scripts de utilidad para búsqueda de herramientas y posts
**Cambios necesarios**:
- Actualizar para usar el nuevo `EmbeddingRepository`
- Eliminar la inicialización directa de PGVectorStore
- Usar la conexión global de la aplicación

## Nueva implementación del módulo de embeddings

### Estructura del módulo
```typescript
// src/Shared/Embedding/Infrastructure/Persistence/PGVector/pgvector.module.ts
@Module({
    providers: [
        {
            provide: 'PGVectorStore',
            useFactory: async (dataSource: DataSource, configService: ConfigService) => {
                const embeddingsGenerator = EmbeddingsProviderFactory.create(configService);
                
                return await PGVectorStore.initialize(
                    embeddingsGenerator,
                    {
                        postgresConnectionOptions: {
                            type: 'postgres',
                            ...dataSource.options
                        },
                        tableName: 'embeddings',
                        columns: {
                            idColumnName: 'id',
                            contentColumnName: 'content',
                            metadataColumnName: 'metadata',
                            vectorColumnName: 'embedding',
                        },
                        distanceStrategy: 'cosine',
                    }
                );
            },
            inject: [DataSource, ConfigService]
        },
        {
            provide: 'EmbeddingRepository',
            useClass: PGVectorEmbeddingRepository
        }
    ],
    exports: ['PGVectorStore', 'EmbeddingRepository']
})
export class PGVectorModule {}
```

### Nuevo repositorio simplificado
```typescript
// src/Shared/Embedding/Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository.ts
@Injectable()
export class PGVectorEmbeddingRepository implements EmbeddingRepository {
    constructor(
        @Inject('PGVectorStore') private readonly vectorStore: PGVectorStore,
        private readonly embeddingsGenerator: Embeddings
    ) {}

    async search(query: string, limit: number = 5, metadataFilter?: Record<string, any>): Promise<Embedding[]> {
        try {
            const results = await this.vectorStore.similaritySearch(
                query,
                limit,
                metadataFilter
            );
            
            return results.map(doc => this.documentToDomain(doc));
        } catch (error) {
            console.error('❌ Error en search:', error);
            return [];
        }
    }

    // ... resto de métodos del repositorio ...
}
```

### Ventajas de la nueva implementación
1. **Código más limpio y directo**
   - Eliminación de la lógica de inicialización del vectorStore
   - Métodos más concisos y enfocados
   - Mejor manejo de errores

2. **Mejor gestión de dependencias**
   - Inyección del vectorStore ya inicializado
   - Uso de la conexión global de la aplicación
   - Configuración centralizada

3. **Mejor separación de responsabilidades**
   - El módulo maneja la inicialización
   - El repositorio se enfoca en operaciones CRUD
   - Clara separación entre configuración y lógica de negocio

4. **Facilidad de testing**
   - Posibilidad de mockear el vectorStore
   - Tests más simples y enfocados
   - Mejor cobertura de código

5. **Mantenibilidad mejorada**
   - Menos código que mantener
   - Menos puntos de fallo
   - Más fácil de entender y modificar

## Pasos para la migración

1. **Preparación**:
   - Asegurar que el nuevo `EmbeddingRepository` está completamente funcional
   - Verificar que la conexión global está configurada correctamente
   - Crear tests para validar la funcionalidad del nuevo repositorio

2. **Migración de datos**:
   - Crear script de migración para mover datos de las tablas antiguas a la nueva
   - Validar la integridad de los datos después de la migración
   - Mantener las tablas antiguas temporalmente como respaldo

3. **Actualización de dependencias**:
   - Actualizar los módulos que usan embeddings para inyectar el nuevo repositorio
   - Eliminar las implementaciones antiguas una vez verificada la migración
   - Actualizar la documentación

4. **Validación**:
   - Probar todas las funcionalidades que usan embeddings
   - Verificar el rendimiento de las búsquedas
   - Asegurar que no hay regresiones

5. **Limpieza**:
   - Eliminar código obsoleto
   - Actualizar la documentación
   - Eliminar las tablas antiguas una vez confirmada la migración exitosa

## Seguimiento de la migración

### Preparación
- [ ] Verificar que el nuevo `EmbeddingRepository` está completamente funcional
- [ ] Configurar la conexión global correctamente
- [ ] Crear y ejecutar tests del nuevo repositorio
- [ ] Documentar la nueva implementación

### Migración de datos
- [ ] Crear script de migración
- [ ] Ejecutar migración en entorno de desarrollo
- [ ] Validar integridad de datos migrados
- [ ] Ejecutar migración en entorno de staging
- [ ] Ejecutar migración en producción

### Actualización de dependencias
- [ ] ToolVectorSearcher
  - [ ] Verificar que usa el nuevo repositorio
  - [ ] Probar funcionalidad
- [ ] PostgreToolVectorRepository
  - [ ] Migrar funcionalidad al nuevo repositorio
  - [ ] Actualizar métodos search y searchSimilarByIds
  - [ ] Probar funcionalidad
  - [ ] Eliminar implementación antigua
- [ ] OllamaLangchainUserToolSuggestionsRepository
  - [ ] Verificar que usa el nuevo repositorio
  - [ ] Probar funcionalidad
- [ ] Scripts de utilidad
  - [ ] Actualizar search-tools.ts
  - [ ] Actualizar search-posts.ts
  - [ ] Actualizar misc/search-tools.ts
  - [ ] Probar todos los scripts

### Validación
- [ ] Probar búsqueda de herramientas
- [ ] Probar búsqueda de posts
- [ ] Probar generación de sugerencias
- [ ] Verificar rendimiento de búsquedas
- [ ] Validar que no hay regresiones

### Limpieza
- [ ] Eliminar código obsoleto
- [ ] Actualizar documentación
- [ ] Eliminar tablas antiguas
- [ ] Eliminar scripts de migración

### Consideraciones
- [ ] Verificar compatibilidad con código existente
- [ ] Monitorear rendimiento
- [ ] Validar seguridad
- [ ] Actualizar documentación final

## Consideraciones importantes

1. **Mantenimiento de la compatibilidad**:
   - Asegurar que la interfaz del nuevo repositorio mantiene la compatibilidad con el código existente
   - Proporcionar un período de gracia donde ambas implementaciones coexistan

2. **Rendimiento**:
   - Monitorear el rendimiento durante y después de la migración
   - Optimizar índices y consultas según sea necesario

3. **Seguridad**:
   - Mantener las mismas políticas de seguridad y acceso
   - Validar que los datos sensibles se manejan correctamente

4. **Documentación**:
   - Actualizar toda la documentación relacionada con embeddings
   - Documentar el proceso de migración para referencia futura 