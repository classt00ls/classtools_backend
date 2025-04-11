# Análisis del Problema con Embeddings en PostgreSQL

## Descripción del Problema

Actualmente, la aplicación está configurada para utilizar dos conexiones diferentes a PostgreSQL:

1. **Conexión Principal** (para NestJS/TypeORM): Esta conexión funciona correctamente y se utiliza para el resto de la aplicación.
   - Configurada con variables: `DB_HOST`, `DB_PORT`, etc.
   - Apunta a `db.mrdvfjqdmxqmrtzhhfms.supabase.co:5432`

2. **Conexión para Embeddings** (PGVector): Esta conexión está fallando.
   - Configurada con variables: `PGVECTOR_HOST`, `PGVECTOR_PORT`, etc.
   - Actualmente apunta a `10.13.13.1:5432` que no es accesible

Como solución temporal, se ha establecido `USE_MOCK_EMBEDDINGS=true` en el archivo `.env` para utilizar una implementación simulada (`MockPGVectorEmbeddingRepository`) que devuelve valores vacíos.

## Causas Probables

1. La conexión a PostgreSQL para embeddings está configurada con un host diferente (`10.13.13.1`) que posiblemente:
   - Es una dirección interna no accesible desde el entorno de producción
   - No tiene configurada correctamente la extensión pgvector
   - Tiene restricciones de firewall o acceso

2. Se están utilizando dos conjuntos separados de configuraciones, lo que aumenta la complejidad y puntos de fallo.

## Solución Propuesta: Uso de la Misma Conexión Principal

Propongo unificar las conexiones para que los embeddings utilicen la misma conexión principal que ya funciona correctamente.

### Pasos para Implementar la Solución

#### 1. Modificar la Configuración de Entorno

```diff
# .env

# Base de datos principal para NestJS/TypeORM
DB_HOST=db.mrdvfjqdmxqmrtzhhfms.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tz1D6kj9CNHwHGJA
DB_NAME=classtools
DB_SSL=false

# Base de datos para PGVector/Embeddings (cambiamos para usar la misma conexión)
-PGVECTOR_HOST=10.13.13.1
+PGVECTOR_HOST=db.mrdvfjqdmxqmrtzhhfms.supabase.co
PGVECTOR_PORT=5432
PGVECTOR_USER=postgres
PGVECTOR_PASSWORD=tz1D6kj9CNHwHGJA
PGVECTOR_DB=classtools
PGVECTOR_SSL=false

# Desactivamos el mock una vez tengamos la conexión correcta configurada
-USE_MOCK_EMBEDDINGS=true
+USE_MOCK_EMBEDDINGS=false
```

#### 2. Modificar el Código para Reutilizar la Conexión

Modificar `PGVectorEmbeddingRepository` para que pueda opcionalmente reutilizar una conexión existente:

```typescript
// src/Shared/Embedding/Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository.ts

// Añadir opción para usar la conexión existente
constructor(
  private readonly configService?: ConfigService,
  private readonly existingDataSource?: DataSource
) {
  // Configuración de embeddings...
  
  // Si se proporciona una fuente de datos existente, úsala
  if (this.existingDataSource) {
    this.initializeFromExistingConnection();
  }
}

private async initializeFromExistingConnection() {
  // Utilizar la conexión existente para inicializar PGVectorStore
  // ...
}
```

#### 3. Modificar el Módulo de Embeddings

Actualizar `EmbeddingModule` para inyectar la conexión principal en el repositorio de embeddings:

```typescript
// src/Shared/Embedding/embedding.module.ts

@Module({
  // ...
  providers: [
    // ...
    {
      provide: 'EmbeddingRepository',
      useFactory: (configService: ConfigService, dataSource: DataSource) => {
        console.log('🔍 Inicializando EmbeddingRepository...');
        
        try {
          const useMock = configService.get<string>('USE_MOCK_EMBEDDINGS') === 'true';
          
          if (useMock) {
            console.log('⚠️ Usando implementación MOCK de EmbeddingRepository');
            return new MockPGVectorEmbeddingRepository();
          } else {
            console.log('✅ Usando implementación REAL de EmbeddingRepository con la conexión principal');
            return new PGVectorEmbeddingRepository(configService, dataSource);
          }
        } catch (error) {
          console.error('❌ Error en factory de EmbeddingRepository:', error);
          console.log('⚠️ Fallback a implementación MOCK por error');
          return new MockPGVectorEmbeddingRepository();
        }
      },
      inject: [ConfigService, DataSource],
    },
    // ...
  ],
  // ...
})
export class EmbeddingModule {
  // ...
}
```

### Consideraciones Adicionales

1. **Migración de Datos Existentes**: Si ya existen embeddings en otra base de datos, será necesario migrarlos a la base de datos principal.

2. **Pruebas de Rendimiento**: Evaluar el impacto en el rendimiento al consolidar ambas conexiones. Podría ser beneficioso por la reducción de conexiones, pero también podría aumentar la carga en la base de datos principal.

3. **Respaldo y Punto de Recuperación**: Crear un respaldo antes de realizar estos cambios para poder revertirlos si surgen problemas.

4. **Implementación Progresiva**:
   - Implementar primero en un entorno de desarrollo
   - Luego en staging
   - Finalmente en producción

5. **Monitoreo**: Establecer métricas de monitoreo específicas para:
   - Tiempo de respuesta de consultas de embeddings
   - Uso de memoria y CPU
   - Errores de conexión o consultas

## Beneficios Esperados

1. **Simplicidad**: Un solo conjunto de credenciales y conexiones para mantener.
2. **Confiabilidad**: Eliminación de un punto de fallo adicional.
3. **Mantenimiento**: Menos configuraciones para gestionar y actualizar.
4. **Coherencia**: Los datos y embeddings permanecen en la misma base de datos.

## Plan de Implementación

1. **Fase 1**: Preparación (1 día)
   - Preparar script de migración si es necesario

2. **Fase 2**: Desarrollo (2-3 días)
   - Implementar cambios en el código para utilizar la conexión principal
   - Actualizar configuración de entorno
   - Pruebas unitarias y de integración

3. **Fase 3**: Despliegue (1-2 días)
   - Implementar en entorno de desarrollo y probar
   - Implementar en staging y verificar
   - Implementar en producción con monitoreo activo

4. **Fase 4**: Verificación y Optimización (1 semana)
   - Monitorear rendimiento y errores
   - Optimizar índices o consultas si es necesario
   - Documentar la nueva arquitectura 
   
## Plan de Acción Detallado para Implementación

A continuación se presenta un plan de acción detallado con pasos específicos para que un agente de IA pueda implementar la solución de unificación de conexiones de base de datos para embeddings.

### Fase 1: Preparación

#### Paso 1: Crear copia de seguridad
1. Ejecutar backup de la base de datos actual:
   ```bash
   pg_dump -h db.mrdvfjqdmxqmrtzhhfms.supabase.co -U postgres -d classtools -f classtools_backup_$(date +%Y%m%d).sql
   ```
2. Verificar que el backup se ha creado correctamente:
   ```bash
   ls -la classtools_backup_*.sql
   ```

#### Paso 2: Crear una rama Git para los cambios
1. Crear una nueva rama:
   ```bash
   git checkout -b fix/unify-database-connections
   ```
2. Verificar que estás en la nueva rama:
   ```bash
   git branch
   ```

### Fase 2: Modificación de Configuración

#### Paso 3: Actualizar variables de entorno
1. Modificar el archivo `.env`:
   ```bash
   sed -i 's/PGVECTOR_HOST=10.13.13.1/PGVECTOR_HOST=db.mrdvfjqdmxqmrtzhhfms.supabase.co/g' .env
   ```
2. Mantener `USE_MOCK_EMBEDDINGS=true` por ahora (no lo modificamos aún)
3. Verificar los cambios:
   ```bash
   grep PGVECTOR_HOST .env
   ```

### Fase 3: Modificación del Código

#### Paso 4: Actualizar PGVectorEmbeddingRepository
1. Abrir el archivo `src/Shared/Embedding/Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository.ts`
2. Modificar el constructor para aceptar una fuente de datos existente:
   ```typescript
   constructor(
     private readonly configService?: ConfigService,
     private readonly existingDataSource?: DataSource
   ) {
     console.log('🔄 PGVectorEmbeddingRepository: Constructor iniciado');
     
     // Configuración del generador de embeddings
     const ollamaBaseUrl = this.getConfigOrDefault('OLLAMA_BASE_URL', 'http://localhost:11434');
     const embedModel = this.getConfigOrDefault('OLLAMA_EMBEDDINGS_MODEL', 'nomic-embed-text');
     
     this.embeddingsGenerator = new OllamaEmbeddings({
       model: embedModel,
       baseUrl: ollamaBaseUrl,
     });
     
     // Si se proporciona una fuente de datos existente, úsala
     if (this.existingDataSource) {
       this.initializeFromExistingConnection();
     }
   }
   ```

3. Implementar el método para inicializar desde una conexión existente:
   ```typescript
   private async initializeFromExistingConnection() {
     try {
       console.log('🔄 Inicializando PGVectorStore desde conexión existente');
       
       // Obtener configuración para la tabla y columnas
       const tableName = this.getConfigOrDefault('PGVECTOR_TABLE', 'embeddings');
       const idColumnName = this.getConfigOrDefault('PGVECTOR_COL_ID', 'id');
       const contentColumnName = this.getConfigOrDefault('PGVECTOR_COL_CONTENT', 'content');
       const metadataColumnName = this.getConfigOrDefault('PGVECTOR_COL_METADATA', 'metadata');
       const vectorColumnName = this.getConfigOrDefault('PGVECTOR_COL_VECTOR', 'embedding');
       
       // Crear el PGVectorStore usando la conexión existente
       const dbConfig = this.existingDataSource.options as any;
      
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
           } as PoolConfig,
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
       
       console.log('✅ PGVectorStore inicializado con conexión existente');
     } catch (error) {
       console.error('❌ Error inicializando PGVectorStore desde conexión existente:', error);
       throw error;
     }
   }
   ```

4. Verificar la implementación asegurando que no haya errores de sintaxis:
   ```bash
   npx tsc --noEmit
   ```

#### Paso 5: Actualizar EmbeddingModule
1. Abrir el archivo `src/Shared/Embedding/embedding.module.ts`
2. Modificar el proveedor del repositorio para inyectar DataSource:
   ```typescript
   {
     provide: 'EmbeddingRepository',
     useFactory: (configService: ConfigService, dataSource: DataSource) => {
       console.log('🔍 Inicializando EmbeddingRepository...');
       
       try {
         // Decidir qué implementación usar
         const useMock = configService.get<string>('USE_MOCK_EMBEDDINGS') === 'true';
         
         if (useMock) {
           console.log('⚠️ Usando implementación MOCK de EmbeddingRepository');
           return new MockPGVectorEmbeddingRepository();
         } else {
           console.log('✅ Usando implementación REAL de EmbeddingRepository con la conexión principal');
           return new PGVectorEmbeddingRepository(configService, dataSource);
         }
       } catch (error) {
         console.error('❌ Error en factory de EmbeddingRepository:', error);
         console.log('⚠️ Fallback a implementación MOCK por error');
         return new MockPGVectorEmbeddingRepository();
       }
     },
     inject: [ConfigService, DataSource],
   }
   ```

3. Asegurarse de importar DataSource:
   ```typescript
   import { DataSource } from 'typeorm';
   ```

4. Comprobar si no hay errores de sintaxis:
   ```bash
   npx tsc --noEmit
   ```

### Fase 4: Pruebas en Desarrollo

#### Paso 6: Pruebas unitarias
1. Ejecutar pruebas unitarias si existen:
   ```bash
   npm run test
   ```

#### Paso 7: Pruebas de integración en entorno local
1. Iniciar la aplicación en modo desarrollo:
   ```bash
   npm run start:dev
   ```
2. Comprobar los logs para verificar que el repositorio sigue usando el MOCK (porque `USE_MOCK_EMBEDDINGS=true` aún)
3. Verificar que la aplicación funciona normalmente

#### Paso 8: Prueba de la conexión real (manteniendo el mock activo)
1. Crear un script de prueba temporal para validar la conexión:
   ```typescript
   // src/scripts/test-pg-connection.ts
   import { DataSource } from 'typeorm';
   import { ConfigService } from '@nestjs/config';
   import { PGVectorEmbeddingRepository } from '../Shared/Embedding/Infrastructure/Persistence/PGVector/PGVectorEmbeddingRepository';
   
   async function testConnection() {
     try {
       // Configuración similar a la de la aplicación
       const configService = new ConfigService({
         PGVECTOR_HOST: 'db.mrdvfjqdmxqmrtzhhfms.supabase.co',
         PGVECTOR_PORT: '5432',
         PGVECTOR_USER: 'postgres',
         PGVECTOR_PASSWORD: 'tz1D6kj9CNHwHGJA',
         PGVECTOR_DB: 'classtools',
         PGVECTOR_SSL: 'false',
         OLLAMA_BASE_URL: 'http://localhost:11434',
         OLLAMA_EMBEDDINGS_MODEL: 'nomic-embed-text',
       });
       
       // Crear una conexión de prueba
       const dataSource = new DataSource({
         type: 'postgres',
         host: 'db.mrdvfjqdmxqmrtzhhfms.supabase.co',
         port: 5432,
         username: 'postgres',
         password: 'tz1D6kj9CNHwHGJA',
         database: 'classtools',
         ssl: false,
       });
       
       await dataSource.initialize();
       console.log('✅ Conexión a base de datos establecida correctamente');
       
       // Probar repositorio
       const repo = new PGVectorEmbeddingRepository(configService, dataSource);
       
       // Test simple
       const result = await repo.search('test query', 1);
       console.log('🔍 Resultado de búsqueda:', result);
       
       await dataSource.destroy();
       console.log('✅ Prueba completada');
     } catch (error) {
       console.error('❌ Error en la prueba:', error);
     }
   }
   
   testConnection();
   ```

2. Ejecutar el script:
   ```bash
   npx ts-node src/scripts/test-pg-connection.ts
   ```

### Fase 5: Activación en Entorno de Desarrollo

#### Paso 9: Actualizar configuración para usar la implementación real
1. Modificar `.env.development`:
   ```bash
   sed -i 's/USE_MOCK_EMBEDDINGS=true/USE_MOCK_EMBEDDINGS=false/g' .env.development
   ```

2. Reiniciar la aplicación:
   ```bash
   npm run start:dev
   ```

3. Verificar los logs para confirmar que se está usando la implementación real

#### Paso 10: Pruebas de funcionalidad con embeddings reales
1. Probar la funcionalidad de búsqueda de embeddings usando la interfaz de la aplicación
2. Verificar que se obtienen resultados reales y no simulados

### Fase 6: Implementación en Producción

#### Paso 11: Confirmar los cambios
1. Revisar todos los cambios realizados:
   ```bash
   git status
   git diff
   ```

2. Añadir y realizar commit:
   ```bash
   git add .
   git commit -m "feat: unificar conexiones para base de datos de embeddings"
   ```

#### Paso 12: Preparar el cambio en producción
1. Modificar `.env` para producción:
   ```bash
   sed -i 's/USE_MOCK_EMBEDDINGS=true/USE_MOCK_EMBEDDINGS=false/g' .env
   ```

2. Guardar los cambios:
   ```bash
   git add .env
   git commit -m "config: activar embeddings reales en producción"
   ```

#### Paso 13: Desplegar en producción
1. Fusionar los cambios con la rama principal:
   ```bash
   git checkout main
   git merge fix/unify-database-connections
   ```

2. Desplegar en producción según el proceso específico de la aplicación (CI/CD, manual, etc.)

#### Paso 14: Verificar despliegue
1. Revisar los logs de la aplicación en producción
2. Confirmar que el repositorio de embeddings se inicializa correctamente
3. Validar que las búsquedas de embeddings funcionan como se espera

### Fase 7: Seguimiento y Monitorización

#### Paso 15: Configurar monitorización
1. Configurar alertas para errores relacionados con embeddings
2. Monitorizar tiempos de respuesta de consultas vectoriales
3. Establecer una métrica básica de éxito de búsquedas vectoriales

#### Paso 16: Documentación final
1. Actualizar la documentación técnica con los cambios realizados
2. Documentar las mejoras y lecciones aprendidas 