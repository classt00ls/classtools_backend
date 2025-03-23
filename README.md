# ClassTools Backend

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

## Índice
- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
  - [Estructura DDD](#estructura-ddd)
  - [Módulos principales](#módulos-principales)
- [Sistema de Eventos](#sistema-de-eventos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
  - [Desarrollo](#desarrollo)
  - [Producción](#producción)
- [Comandos útiles](#comandos-útiles)
- [Tests](#tests)
- [Docker](#docker)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Descripción

Backend del proyecto ClassTools construido con [NestJS](https://github.com/nestjs/nest), un framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes y escalables.

Este proyecto implementa una arquitectura basada en Domain-Driven Design (DDD) para organizar el código de manera que refleje el dominio del negocio.

## Arquitectura

### Estructura DDD

El proyecto sigue los principios de Domain-Driven Design (DDD) con la siguiente estructura:

```
src/
├── backoffice/              # Contexto acotado para administración
│   ├── Tool/                # Módulo/entidad de herramientas
│   │   ├── Domain/          # Lógica del dominio y reglas de negocio
│   │   │   ├── model.ts     # Entidad de dominio
│   │   │   ├── repository.ts # Interfaz del repositorio
│   │   │   └── events/      # Eventos de dominio
│   │   ├── Application/     # Casos de uso y servicios de aplicación
│   │   │   ├── queries/     # Consultas (CQRS)
│   │   │   └── commands/    # Comandos (CQRS)
│   │   └── Infrastructure/  # Implementaciones concretas
│   │       ├── controllers/ # Controladores API
│   │       └── persistence/ # Implementación del repositorio
│   └── Tag/                 # Otro módulo dentro del contexto
├── discover/                # Contexto acotado para descubrimiento
├── web/                     # Contexto acotado para web pública
└── Shared/                  # Componentes compartidos entre contextos
    ├── Domain/              # Objetos de valor, interfaces, etc.
    └── Infrastructure/      # Servicios compartidos, bases de datos
```

Cada módulo se divide en tres capas principales siguiendo DDD y arquitectura hexagonal:

1. **Domain**: Contiene las entidades, objetos de valor, interfaces de repositorio y lógica de dominio.
2. **Application**: Orquesta los flujos de la aplicación, implementa casos de uso e interactúa con el dominio.
3. **Infrastructure**: Proporciona implementaciones concretas para las interfaces definidas en el dominio.

### Módulos principales

- **Backoffice**: Gestión administrativa de la plataforma.
- **Discover**: Funcionalidad para descubrimiento de herramientas.
- **Web**: APIs públicas para la interfaz web.
- **Shared**: Componentes compartidos entre todos los contextos.

## Sistema de Eventos

El proyecto implementa un sistema de eventos basado en el patrón outbox para garantizar la consistencia eventual y comunicación entre contextos acotados.

### Funcionamiento de los eventos

1. **Generación de eventos**: Las acciones en el sistema generan eventos que se almacenan en la tabla `event_outbox` de la base de datos
2. **Estructura de los eventos**: Cada evento contiene un tipo (`event_type`), datos (`event_data`) y estado de procesamiento
3. **Listeners de eventos**: Se implementan listeners específicos para cada tipo de evento utilizando el decorador `@EventListener('nombre.del.evento')`
4. **Procesamiento de eventos**: Los eventos se procesan a través del controlador `ConsumeEventsController`, que permite procesar eventos de manera selectiva por tipo

### Procesamiento de eventos

El sistema utiliza un controlador dedicado para procesar eventos pendientes:

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

Este controlador:
- Consulta los eventos pendientes del tipo especificado en la tabla `event_outbox`
- Encuentra el listener apropiado para cada evento según su tipo
- Invoca el método `handle` del listener con el evento correspondiente
- Marca el evento como procesado una vez completado con éxito

### Listeners de eventos

Los listeners de eventos son clases anotadas con el decorador `@EventListener` que implementan un método `handle(event)`. Por ejemplo:

```typescript
@EventListener('backoffice.tag.tool.assigned')
export class ToolAssignedListener {
    async handle(event: Event) {
        // Lógica para manejar el evento
    }
}
```

## Instalación

```bash
# Instalación de dependencias
$ npm install
```

## Configuración

El proyecto utiliza archivos de configuración para los diferentes entornos:

```bash
# Copia el archivo de configuración de ejemplo
$ cp .env.example .env.development
```

Edita los valores en `.env.development` según tu entorno local.

## Ejecución

### Desarrollo

```bash
# Modo de desarrollo
$ npm run start:dev

# Modo de desarrollo con depuración
$ npm run start:debug
```

### Producción

```bash
# Construir para producción
$ npm run build

# Ejecutar en modo producción
$ npm run start:prod
```

## Comandos útiles

```bash
# Formatear código
$ npm run format

# Ejecutar linting
$ npm run lint

# Crear vectores de herramientas
$ npm run create-vector-tools

# Buscar vectores de herramientas
$ npm run search-vector-tools
```

## Tests

```bash
# Tests unitarios
$ npm run test

# Tests e2e
$ npm run test:e2e

# Cobertura de tests
$ npm run test:cov
```

## Docker

El proyecto incluye configuración para Docker:

```bash
# Iniciar servicios con Docker Compose
$ docker-compose up -d
```

## Contribución

Por favor, lee la guía de contribución antes de enviar una pull request.

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).