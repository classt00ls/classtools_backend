# Sistema de Multilenguaje en ClassTools

## Arquitectura de Traducción

ClassTools implementa un sistema de multilenguaje basado en **tablas separadas por idioma** para las herramientas (tools). Este enfoque proporciona un alto rendimiento y flexibilidad para manejar contenido en diferentes idiomas.

## Estructura de Tablas

En lugar de utilizar un enfoque tradicional de columnas de idioma o tablas de traducción relacionadas, el sistema utiliza tablas completas y separadas para cada idioma soportado:

```sql
-- Tabla para español
CREATE TABLE tool_es (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    name VARCHAR(255),
    description TEXT,
    excerpt TEXT,
    -- Otros campos...
);

-- Tabla para inglés (misma estructura)
CREATE TABLE tool_en (
    id VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    name VARCHAR(255),
    description TEXT,
    excerpt TEXT,
    -- Otros campos...
);
```

Cada herramienta mantiene el mismo ID a través de todas las tablas de idioma, lo que facilita la correlación entre versiones traducidas.

## Implementación en el Código

### 1. Esquemas Dinámicos

El sistema utiliza una función para crear esquemas de entidad dinámicamente basados en el sufijo del idioma:

```typescript
// Creación dinámica del esquema de tabla según el idioma
export const createToolSchema = (suffix: string = '') => new EntitySchema<ToolModel>({
  name: `Tool${suffix}`,
  columns: {
    // Definición de columnas...
  },
  relations: {
    tags: {
      // Relación many-to-many con sufijo para la tabla de unión
      joinTable: {
        name: `tool_tag${suffix}`,
        // ...
      }
    }
  },
});
```

### 2. Repositorio Base con Sufijo de Idioma

El repositorio base recibe el sufijo de idioma en el constructor:

```typescript
@Injectable()
export abstract class ToolRepository {
  constructor(protected readonly suffix: string = '') {}
  
  // Métodos abstractos...
}
```

### 3. Implementación del Repositorio con Idioma

El repositorio concreto conecta con la tabla específica del idioma:

```typescript
@Injectable()
export class ToolTypeormRepository extends ToolRepository {
  private repository: Repository<ToolModel>;

  constructor(
    datasource: DataSource,
    suffix: string = 'en'  // Inglés por defecto
  ) {
    super(suffix);
    this.repository = datasource.getRepository(createToolSchema(this.suffix));
  }
  
  // Implementación de métodos...
}
```

### 4. Fábrica de Repositorios por Idioma

Los servicios que necesitan acceder a diferentes idiomas utilizan un patrón de factory o crean repositorios específicos por idioma:

```typescript
@Injectable()
export class ToolCreator {
  private repositories: { [key: string]: ToolRepository } = {};
  
  constructor(private dataSource: DataSource) {
    // Inicializar repositorios para los idiomas principales
    this.repositories = {
      es: new ToolTypeormRepository(dataSource, '_es'),
      en: new ToolTypeormRepository(dataSource, '_en')
    };
  }
  
  private getRepositoryForLanguage(lang: string): ToolRepository {
    if (!this.repositories[lang]) {
      this.repositories[lang] = new ToolTypeormRepository(this.dataSource, `_${lang}`);
    }
    return this.repositories[lang];
  }
  
  // Métodos para crear y manipular herramientas en diferentes idiomas...
}
```

## Ventajas de este Enfoque

1. **Alto rendimiento**: Cada tabla está optimizada para su propio idioma sin sobrecarga de filtrado.
2. **Flexibilidad**: Permite esquemas ligeramente diferentes por idioma si es necesario.
3. **Escalabilidad**: Facilita añadir nuevos idiomas creando nuevas tablas.
4. **Simplicidad en consultas**: Las consultas son directas a la tabla del idioma requerido.
5. **Transacciones independientes**: Las actualizaciones en un idioma no afectan los registros en otros idiomas.

## Consideraciones técnicas

1. **Sincronización de IDs**: Es fundamental mantener el mismo ID para la misma herramienta en todos los idiomas.
2. **Coherencia de datos**: Cambios estructurales deben aplicarse a todas las tablas de idioma.
3. **Complejidad en migraciones**: Las migraciones deben ejecutarse para cada tabla de idioma.
4. **Control de transacciones**: Operaciones que afectan a múltiples idiomas deben manejar rollbacks adecuadamente.

## Flujo de Trabajo en Operaciones Multilenguaje

Cuando un servicio necesita realizar una operación que afecta a varios idiomas:

1. Obtiene los repositorios correspondientes para cada idioma requerido
2. Ejecuta las operaciones utilizando el repositorio específico para cada idioma
3. Mantiene la coherencia de datos entre idiomas (mismos IDs, relaciones, etc.)

Este enfoque de tablas separadas por idioma proporciona una solución eficiente y escalable para manejar contenido multilingüe en un sistema con gran volumen de datos y consultas frecuentes.

## Implementación de un Nuevo Idioma

Para añadir soporte para un nuevo idioma en el sistema, sigue estos pasos en orden:

1. **Crear la estructura de tablas en la base de datos**
   ```sql
   -- Crear tabla principal para el nuevo idioma (ej: francés)
   CREATE TABLE tool_fr (
       id VARCHAR(255) PRIMARY KEY NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP,
       deleted_at TIMESTAMP,
       name VARCHAR(255),
       description TEXT,
       excerpt TEXT,
       link VARCHAR(255),
       url VARCHAR(255),
       deleted BOOLEAN DEFAULT false,
       uploaded BOOLEAN DEFAULT false,
       status VARCHAR(50),
       features TEXT,
       stars INTEGER,
       pricing VARCHAR(255),
       html TEXT,
       video_html TEXT,
       video_url VARCHAR(255),
       pros_and_cons TEXT,
       ratings TEXT,
       how_to_use TEXT,
       reviews_content TEXT
   );
   
   -- Crear tabla de relaciones herramienta-etiqueta
   CREATE TABLE tool_tag_fr (
       tool_id VARCHAR(255) NOT NULL,
       tag_id VARCHAR(255) NOT NULL,
       PRIMARY KEY (tool_id, tag_id),
       FOREIGN KEY (tool_id) REFERENCES tool_fr(id),
       FOREIGN KEY (tag_id) REFERENCES tag(id)
   );
   
   -- Crear índices necesarios para mejorar el rendimiento
   CREATE INDEX idx_tool_fr_name ON tool_fr(name);
   CREATE INDEX idx_tool_fr_status ON tool_fr(status);
   ```

2. **Actualizar la inicialización de repositorios**
   - Localiza y actualiza **todas** las clases que inicializan repositorios con idiomas específicos:
     - `ToolCreator`
     - `ToolUpdater`
     - `GetFilteredToolsByLangQueryHandler`
     - `GetToolBySlugQueryHandler`
     - `GetDetailToolQueryHandler`
     - Cualquier otro servicio que utilice `ToolTypeormRepository`
   
   ```typescript
   // Ejemplo en cada constructor
   constructor(private dataSource: DataSource) {
     this.repositories = {
       es: new ToolTypeormRepository(dataSource, '_es'),
       en: new ToolTypeormRepository(dataSource, '_en'),
       fr: new ToolTypeormRepository(dataSource, '_fr') // Nuevo idioma
     };
   }
   
   // Actualizar cualquier factory o proveedor de repositorios
   export const toolTypeormRepositoryFactories = {
     es: { provide: 'ToolRepositoryEs', useFactory: (ds) => new ToolTypeormRepository(ds, '_es') },
     en: { provide: 'ToolRepositoryEn', useFactory: (ds) => new ToolTypeormRepository(ds, '_en') },
     fr: { provide: 'ToolRepositoryFr', useFactory: (ds) => new ToolTypeormRepository(ds, '_fr') }
   };
   ```

3. **Modificar servicios de detección de idioma**
   - Actualizar interceptores, middlewares y guards que manejan la detección de idioma
   - Modificar cualquier validador de idioma para incluir el nuevo código
   - Actualizar los headers HTTP para negociación de contenido (Accept-Language)
   
   ```typescript
   // Constantes de idiomas soportados
   export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr']; // Añadir nuevo idioma
   
   // Middleware/interceptor de detección de idioma
   export class LanguageDetectionMiddleware implements NestMiddleware {
     use(req: Request, res: Response, next: Function) {
       // Añadir el nuevo idioma a la lógica de detección
       const supportedLangs = ['en', 'es', 'fr'];
       // ...resto del código...
     }
   }
   
   // Actualizar configuración de rutas si se basan en prefijos de idioma
   const routes = [
     { path: 'en', module: EnglishModule },
     { path: 'es', module: SpanishModule },
     { path: 'fr', module: FrenchModule } // Nuevo módulo para francés
   ];
   ```

4. **Actualizar componentes y archivos de UI**
   - Modificar selectores de idioma en la interfaz de usuario
   - Crear archivos de traducción para textos estáticos de la UI
   - Actualizar las plantillas que muestran mensajes según el idioma
   
   ```typescript
   // Ejemplo de actualización de selector de idioma
   const languageOptions = [
     { value: 'en', label: 'English' },
     { value: 'es', label: 'Español' },
     { value: 'fr', label: 'Français' } // Nuevo idioma
   ];
   
   // Crear archivos de traducción para la UI
   // src/i18n/fr.json
   {
     "common.search": "Rechercher",
     "common.submit": "Soumettre",
     // ...otros textos...
   }
   ```

5. **Implementar mecanismo de migración de datos**
   - Crear script o proceso para copiar y adaptar datos existentes de otro idioma
   - Incluir manejo de errores y validación de datos
   - Diseñar proceso para mantener relaciones entre entidades
   
   ```typescript
   async function migrateDataToNewLanguage(sourceLanguage: string, targetLanguage: string) {
     const sourceRepo = new ToolTypeormRepository(dataSource, `_${sourceLanguage}`);
     const targetRepo = new ToolTypeormRepository(dataSource, `_${targetLanguage}`);
     
     try {
       // Obtener todas las herramientas del idioma de origen
       const allTools = await sourceRepo.getAll({});
       
       console.log(`Migrando ${allTools.length} herramientas de ${sourceLanguage} a ${targetLanguage}`);
       
       // Transacción para asegurar consistencia
       await dataSource.transaction(async transactionalEntityManager => {
         for (const tool of allTools) {
           // Clonar la herramienta pero mantener el mismo ID para correlación
           const translatedTool = {
             ...tool,
             // Campos que podrían ser traducidos automáticamente
             name: await translateText(tool.name, sourceLanguage, targetLanguage),
             description: await translateText(tool.description, sourceLanguage, targetLanguage),
             excerpt: await translateText(tool.excerpt, sourceLanguage, targetLanguage),
             // ...otros campos traducibles...
           };
           
           // Guardar la herramienta traducida con el repositorio del nuevo idioma
           await targetRepo.save(translatedTool);
           
           // Mantener relaciones con etiquetas
           if (tool.tags && tool.tags.length > 0) {
             // Código para migrar relaciones tag-tool
           }
         }
       });
       
       console.log(`Migración completada: ${allTools.length} herramientas migradas a ${targetLanguage}`);
     } catch (error) {
       console.error(`Error durante la migración: ${error.message}`);
       throw error;
     }
   }
   ```

6. **Configurar procesos de sincronización y traducción**
   - Integrar servicio de traducción automática (Google Translate, DeepL, etc.)
   - Implementar sistema de revisión humana para traducciones automáticas
   - Crear listeners/webhooks para mantener sincronizado el contenido entre idiomas
   
   ```typescript
   // Servicio de traducción con fallback y caché
   @Injectable()
   export class TranslationService {
     // Inyectar cliente de servicio de traducción
     
     async translateContent(content: string, sourceLanguage: string, targetLanguage: string): Promise<string> {
       // Lógica de traducción, manejo de errores y caché
     }
     
     // Método para detectar cambios y propagar traducciones
     async propagateChanges(id: string, sourceLanguage: string): Promise<void> {
       // Detectar cambios y actualizar otros idiomas
     }
   }
   
   // Listener para cambios en herramientas
   @EventListener('tool.updated')
   export class ToolUpdatedListener {
     constructor(private translationService: TranslationService) {}
     
     async handle(event: Event): Promise<void> {
       // Propagar cambios a otros idiomas cuando se actualiza una herramienta
     }
   }
   ```

7. **Actualizar toda la lógica de búsqueda, filtrado y API**
   - Modificar todos los endpoints que devuelven datos basados en idioma
   - Actualizar servicios de búsqueda para incluir el nuevo idioma
   - Ajustar cualquier índice de búsqueda específico por idioma
   
   ```typescript
   // Repositorio con búsqueda por idioma
   @Injectable()
   export class ToolSearchService {
     private repositories: Record<string, ToolRepository> = {};
     
     constructor(private dataSource: DataSource) {
       // Inicializar repositorios incluyendo el nuevo idioma
       this.repositories = {
         en: new ToolTypeormRepository(dataSource, '_en'),
         es: new ToolTypeormRepository(dataSource, '_es'),
         fr: new ToolTypeormRepository(dataSource, '_fr') // Nuevo idioma
       };
     }
     
     async search(query: string, language: string): Promise<ToolModel[]> {
       // Validar que el idioma solicitado existe
       if (!this.repositories[language]) {
         throw new BadRequestException(`Idioma no soportado: ${language}`);
       }
       
       // Realizar búsqueda en el repositorio del idioma correcto
       return this.repositories[language].search(query);
     }
   }
   ```

8. **Actualizar lógica de fallback para contenido**
   - Implementar lógica para manejar casos donde el contenido no existe en el idioma solicitado
   - Configurar redirecciones a contenido en idioma alternativo
   
   ```typescript
   // Servicio de gestión de contenido con fallback
   @Injectable()
   export class ContentService {
     constructor(private readonly repositories: Record<string, ToolRepository>) {}
     
     async getToolByIdWithFallback(id: string, language: string): Promise<ToolModel> {
       try {
         // Intentar obtener en el idioma solicitado
         return await this.repositories[language].getOneByIdOrFail(id);
       } catch (error) {
         if (error instanceof NotFoundException) {
           console.log(`Contenido no disponible en ${language}, usando fallback`);
           // Intentar con el idioma predeterminado (inglés)
           return await this.repositories['en'].getOneByIdOrFail(id);
         }
         throw error;
       }
     }
   }
   ```

9. **Crear pruebas para el nuevo idioma**
   - Desarrollar tests unitarios para repositorios y servicios
   - Implementar tests de integración para API y base de datos
   - Crear tests end-to-end para flujos completos
   - Incluir pruebas para caracteres especiales o particularidades del idioma
   
   ```typescript
   describe('Herramientas en francés', () => {
     // Setup...
     
     it('debe crear herramientas correctamente en francés', async () => {
       // Test para creación de herramientas en francés
     });
     
     it('debe manejar correctamente caracteres especiales franceses', async () => {
       // Test específico para caracteres especiales: é, è, ç, etc.
     });
     
     it('debe mantener relaciones con tags al crear en francés', async () => {
       // Test para verificar relaciones
     });
   });
   ```

10. **Actualizar la documentación y mensajes del sistema**
    - Documentación técnica y de usuario
    - Mensajes de error y ayuda en el nuevo idioma
    - Guías de uso para contenido en el nuevo idioma
    
    ```typescript
    // Mensajes de error por idioma
    const errorMessages = {
      en: {
        'not_found': 'Resource not found',
        'validation': 'Validation error'
      },
      es: {
        'not_found': 'Recurso no encontrado',
        'validation': 'Error de validación'
      },
      fr: {
        'not_found': 'Ressource non trouvée',
        'validation': 'Erreur de validation'
      }
    };
    ```

11. **Implementar consideraciones de SEO y metadatos**
    - Configurar etiquetas hreflang para vincular versiones en diferentes idiomas
    - Actualizar metadatos específicos por idioma
    - Implementar URLs con indicador de idioma
    
    ```html
    <!-- Ejemplo de etiquetas hreflang -->
    <link rel="alternate" hreflang="en" href="https://example.com/en/tool/123" />
    <link rel="alternate" hreflang="es" href="https://example.com/es/tool/123" />
    <link rel="alternate" hreflang="fr" href="https://example.com/fr/tool/123" />
    ```

12. **Monitoreo, métricas y ajustes**
    - Implementar métricas para el nuevo idioma
    - Monitorear rendimiento, uso y errores
    - Configurar alertas para problemas específicos del idioma
    - Recopilar feedback de usuarios del nuevo idioma
    
    ```typescript
    // Ejemplo de métricas específicas por idioma
    @Injectable()
    export class LanguageMetricsService {
      // Contador de uso por idioma
      private languageUsage: Record<string, number> = {
        en: 0,
        es: 0,
        fr: 0 // Añadir nuevo idioma
      };
      
      recordUsage(language: string): void {
        if (this.languageUsage[language] !== undefined) {
          this.languageUsage[language]++;
        }
      }
      
      getMetrics(): Record<string, number> {
        return { ...this.languageUsage };
      }
    }
    ```

Siguiendo estos pasos exhaustivos se garantiza una implementación completa y funcional de un nuevo idioma en el sistema, abarcando todos los aspectos desde la base de datos hasta la interfaz de usuario y el monitoreo. 