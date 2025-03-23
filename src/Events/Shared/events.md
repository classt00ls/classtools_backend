# Sistema de Eventos en ClassTools

## Arquitectura de Eventos

El sistema de eventos en ClassTools se basa en un patrón de outbox para garantizar la fiabilidad en el procesamiento de eventos asíncronos. El sistema consta de los siguientes componentes principales:

### 1. Almacenamiento de Eventos (Event Outbox)

Los eventos se almacenan en una tabla `event_outbox` con la siguiente estructura:

- `id`: Identificador único del evento (UUID)
- `event_type`: Tipo de evento (string)
- `event_data`: Datos del evento (JSON)
- `created_at`: Fecha de creación
- `processed_at`: Fecha de procesamiento (opcional)
- `status`: Estado del evento ('pending', 'processing', 'completed', 'failed')
- `error_message`: Mensaje de error en caso de fallo (opcional)
- `retries`: Número de reintentos

### 2. Registro de Eventos

Los eventos se registran en el sistema mediante el repositorio `EventOutboxRepository` que proporciona métodos para:

- `save`: Guardar un nuevo evento en estado 'pending'
- `getPendingEvents`: Obtener eventos pendientes de procesar
- `markAsProcessing`: Marcar un evento como 'processing'
- `markAsCompleted`: Marcar un evento como 'completed'
- `markAsFailed`: Marcar un evento como 'failed' y registrar el error

### 3. Procesamiento de Eventos

El procesamiento de eventos se realiza mediante el controlador `ConsumeEventsController` que:

1. Recibe una solicitud con el tipo de evento a procesar y el límite de eventos
2. Obtiene los eventos pendientes del tipo especificado
3. Para cada evento:
   - Lo marca como 'processing'
   - Emite el evento al listener correspondiente
   - Si se procesa correctamente, lo marca como 'completed'
   - Si falla, lo marca como 'failed' y registra el error

Este controlador se accede a través de un endpoint dedicado:

```bash
# Endpoint para consumir eventos
POST /api/backoffice/events/consume
```

Parámetros:
- `eventType`: Tipo de evento a procesar (opcional, si no se especifica se procesan todos los tipos)
- `limit`: Número máximo de eventos a procesar (opcional, valor por defecto definido en el sistema)

Ejemplo de uso con curl:
```bash
# Procesar hasta 10 eventos del tipo 'backoffice.tag.tool.assigned'
curl -X POST \
  http://localhost:3000/api/backoffice/events/consume \
  -H 'Content-Type: application/json' \
  -d '{
    "eventType": "backoffice.tag.tool.assigned",
    "limit": 10
  }'
```

### 4. Listeners de Eventos

Los listeners se registran utilizando el decorador `@EventListener('tipo.de.evento')` y se configuran automáticamente a través del servicio `EventAutoRegister`.

Ejemplo de listener:

```typescript
@EventListener('backoffice.tag.tool.assigned')
@Injectable()
export class ToolAssignedListener {
    // ...
    
    async handle(event: Event) {
        // Lógica para manejar el evento
    }
}
```

El sistema automáticamente registra estos listeners en tiempo de ejecución y los asocia con los tipos de eventos correspondientes.

## Flujo de Procesamiento de Eventos

1. Un componente de la aplicación genera un evento y lo guarda en la tabla `event_outbox`
2. Se realiza una llamada al controlador `ConsumeEventsController` especificando el tipo de evento y límite
3. El controlador obtiene los eventos pendientes del tipo especificado y para cada uno:
   - Lo marca como 'processing'
   - Emite el evento al listener correspondiente
   - Los listeners registrados para ese tipo de evento reciben y procesan el evento
   - El evento se marca como 'completed' o 'failed' según el resultado

## Caso de Uso: ToolAssignedListener

Un ejemplo práctico del sistema de eventos es el `ToolAssignedListener`, que maneja el evento `backoffice.tag.tool.assigned` y determina si una etiqueta debe convertirse en categoría basándose en el número de herramientas asociadas.

### Flujo de Funcionamiento

1. Se emite un evento `backoffice.tag.tool.assigned` cuando una herramienta es asignada a una etiqueta
2. El `ToolAssignedListener` captura este evento y:
   - Obtiene todas las herramientas asociadas a esa etiqueta
   - Si hay más de 10 herramientas, evalúa si la etiqueta debe convertirse en categoría

### Lógica de Decisión

El listener implementa la siguiente lógica para determinar qué etiquetas se convierten en categorías:

1. **Menos de 10 categorías existentes**:
   - Si una etiqueta tiene más de 10 herramientas, se convierte automáticamente en categoría
   - Se actualiza el contador `tools_num` de la categoría

2. **10 o más categorías existentes**:
   - Encuentra la categoría con menor número de herramientas
   - Si la etiqueta actual tiene más herramientas que esta categoría:
     - Elimina la categoría con menos herramientas
     - Crea una nueva categoría con la etiqueta actual
   - En caso contrario, no hace cambios

### Código Relevante

```typescript
async handle(event: Event) {
    // Registramos la asignación de la herramienta a la etiqueta
    this.logger.log(`Tool ${event.event_data.toolId} assigned to tag ${event.event_data.tagId}`);

    // Obtenemos todas las herramientas asociadas a la etiqueta actual
    const tools = await repository.findByTagId(event.event_data.tagId);

    // Si la etiqueta tiene más de 10 herramientas, evaluamos si debe convertirse en categoría
    if (tools.length > 10) {
        // Obtenemos el número total de categorías
        const categoryCount = await this.categoryRepository.countAll();
        
        // Si hay menos de 10 categorías, procedemos con la lógica original
        if (categoryCount < 10) {
            await this.createNewCategory(event, tools.length);
        } else {
            // Si ya hay 10 o más categorías, buscamos la que tiene menos herramientas
            await this.findCategoryWithFewestTools(event, tools.length);
        }
    }
}
```

## Ventajas del Sistema

- **Fiabilidad**: Los eventos se almacenan antes de procesarse, lo que permite reintentos
- **Trazabilidad**: Se registra el estado de cada evento y los errores
- **Desacoplamiento**: Los productores y consumidores de eventos están desacoplados
- **Transaccionalidad**: Los eventos se pueden guardar en la misma transacción que los cambios de datos
- **Procesamiento selectivo**: La capacidad de procesar eventos por tipo y limitar la cantidad proporciona flexibilidad

## Diagnóstico de Problemas

Si existen problemas en el procesamiento de eventos:

1. Verificar la tabla `event_outbox` para eventos en estado 'failed'
2. Revisar los mensajes de error asociados
3. Comprobar que los listeners están correctamente registrados
4. Verificar las rutas de importación en los archivos de eventos
5. Probar el procesamiento manual de eventos específicos mediante el controlador

## Problema Específico de Importación en Módulos

Si existen problemas con las importaciones de módulos al ejecutar scripts directamente con ts-node, hay que tener en cuenta que estos scripts no tienen acceso a la configuración de rutas (path aliases) que NestJS configura automáticamente.

### Posibles Soluciones

Para evitar problemas con las importaciones:

1. **Configurar Path Aliases**: Utilizar los alias de ruta de TypeScript (en `tsconfig.json`) y asegurarse de que todos los scripts los usen:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["src/Shared/*"],
      "@infrastructure/*": ["src/Infrastructure/*"]
    }
  }
}
```

2. **Ejecutar Scripts con tsconfig-paths**: Modificar los scripts para incluir el registro de rutas:

```json
"scripts": {
  "process-events": "ts-node -r tsconfig-paths/register src/process-events.ts"
}
```

## Conclusión

El sistema de eventos de ClassTools implementa un patrón robusto y confiable para el manejo de eventos asíncronos. Este enfoque proporciona una base sólida para construir una arquitectura orientada a eventos que permite:

1. **Desacoplar componentes**: Los productores y consumidores de eventos operan de forma independiente
2. **Garantizar la entrega de eventos**: Incluso en caso de fallos, los eventos pueden procesarse posteriormente
3. **Monitorizar y auditar**: El registro detallado facilita el seguimiento y diagnóstico de problemas
4. **Escalar horizontalmente**: Permite distribuir el procesamiento de eventos entre diferentes servicios
5. **Procesar selectivamente**: La capacidad de elegir qué eventos procesar y cuántos mejora el control operativo

La combinación del patrón outbox con los listeners específicos y el `ConsumeEventsController` proporciona una solución elegante para implementar lógica de negocio compleja, como el ejemplo del `ToolAssignedListener` que convierte etiquetas en categorías basándose en reglas dinámicas.

A medida que el sistema evolucione, se recomienda mantener esta arquitectura y considerar mejoras como:

- Implementar una programación para invocar automáticamente el controlador a intervalos regulares
- Añadir un dashboard de monitorización para los eventos
- Implementar políticas de reintentos más sofisticadas para eventos fallidos
- Considerar la migración a un bus de eventos dedicado para sistemas de mayor escala 