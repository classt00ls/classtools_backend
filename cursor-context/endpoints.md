# API_ENDPOINTS.md

# Documentación de Endpoints de ClassTools.io

Este documento describe los principales endpoints disponibles en la API de ClassTools.io, organizados por aplicación.

## 1. Aplicación Web (apps/web)

### Endpoints de Herramientas (Tool)

#### GET `/tool/slug`
- **Descripción**: Obtiene una herramienta por su slug (nombre formateado)
- **Parámetros**:
  - `slug` (query, obligatorio): El nombre de la herramienta
  - `lang` (query, opcional): El idioma de la herramienta (por defecto 'es')
- **Respuesta**: Objeto detallado de la herramienta
- **Formato de Respuesta (DTO)**:
  ```json
  {
    "id": "string",                // ID único de la herramienta
    "name": "string",              // Nombre de la herramienta
    "url": "string",               // URL de la herramienta
    "background_image": "string",  // URL de la imagen de fondo
    "pricing": "string",           // Información de precios en texto
    "stars": "string",             // Valoración en estrellas
    "excerpt": "string",           // Resumen corto
    "features": "string",          // Características en formato JSON
    "description": "string",       // Descripción completa
    "link": "boolean",             // Si tiene enlace válido
    "isBookmarked": "boolean",     // Si está en favoritos del usuario
    "totalBookmarked": "boolean",  // Total de usuarios que la tienen en favoritos
    "category": "number",          // ID de la categoría
    "tags": [                      // Array de etiquetas
      {
        "id": "string",            // ID de la etiqueta
        "name": "string"           // Nombre de la etiqueta
      }
    ],
    "video_url": "string",         // URL del video demostrativo
    "prosAndCons": "string",       // Pros y contras en formato JSON
    "ratings": "string",           // Valoraciones detalladas
    "howToUse": "string"           // Instrucciones de uso
  }
  ```

#### GET `/tool`
- **Descripción**: Obtiene todas las herramientas
- **Parámetros**: 
  - `page` (query, opcional): Número de página
  - `pageSize` (query, opcional): Tamaño de página
- **Respuesta**: Lista de herramientas con recuento total
- **Formato de Respuesta (DTO)**:
  ```json
  {
    "data": [                      // Array de herramientas
      {
        "id": "string",            // ID único de la herramienta
        "name": "string",          // Nombre de la herramienta
        "url": "string",           // URL de la herramienta
        "pricing": "string",       // Información de precios
        "background_image": "string", // URL de la imagen de fondo
        "price": "string",         // Precio en texto
        "stars": "string",         // Valoración en estrellas
        "excerpt": "string",       // Resumen corto
        "description": "string",   // Descripción completa
        "link": "boolean",         // Si tiene enlace válido
        "isBookmarked": "boolean", // Si está en favoritos del usuario
        "totalBookmarked": "boolean", // Total de usuarios que la tienen en favoritos
        "category": "number",      // ID de la categoría
        "tags": [                  // Array de etiquetas
          {
            "id": "string",        // ID de la etiqueta
            "name": "string"       // Nombre de la etiqueta
          }
        ]
      }
    ],
    "count": "number"              // Número total de herramientas
  }
  ```

#### GET `/tool/:id`
- **Descripción**: Obtiene una herramienta por su ID
- **Parámetros**:
  - `id` (path, obligatorio): ID de la herramienta
- **Respuesta**: Objeto detallado de la herramienta
- **Formato de Respuesta (DTO)**: Mismo formato que el endpoint `/tool/slug`

### Endpoints de Búsqueda de Herramientas

#### GET `/tool/search`
- **Descripción**: Busca herramientas con filtros específicos
- **Parámetros**:
  - `page` (query, opcional): Número de página
  - `pageSize` (query, opcional): Tamaño de página
  - `filters` (query, opcional): Objeto con filtros (categorías, estrellas, título, etc.)
- **Respuesta**: Objeto con datos de herramientas y recuento total
- **Formato de Respuesta (DTO)**:
  ```json
  {
    "data": [                      // Array de herramientas filtradas
      {
        "id": "string",            // ID único de la herramienta
        "name": "string",          // Nombre de la herramienta
        "url": "string",           // URL de la herramienta
        "pricing": "string",       // Información de precios
        "background_image": "string", // URL de la imagen de fondo
        "price": "string",         // Precio en texto
        "stars": "string",         // Valoración en estrellas
        "excerpt": "string",       // Resumen corto
        "description": "string",   // Descripción completa
        "link": "boolean",         // Si tiene enlace válido
        "isBookmarked": "boolean", // Si está en favoritos del usuario
        "totalBookmarked": "boolean", // Total de usuarios que la tienen en favoritos
        "category": "number",      // ID de la categoría
        "tags": [                  // Array de etiquetas
          {
            "id": "string",        // ID de la etiqueta
            "name": "string"       // Nombre de la etiqueta
          }
        ]
      }
    ],
    "count": "number"              // Número total de herramientas que coinciden con los filtros
  }
  ```

#### GET `/tool/search/lang`
- **Descripción**: Busca herramientas en un idioma específico
- **Parámetros**:
  - `page` (query, opcional): Número de página
  - `pageSize` (query, opcional): Tamaño de página
  - `filters` (query, opcional): Objeto con filtros
  - `lang` (query, obligatorio): Idioma de búsqueda
- **Respuesta**: Objeto con datos de herramientas y recuento total
- **Formato de Respuesta (DTO)**: Mismo formato que el endpoint `/tool/search`

#### GET `/tool/search/scrap`
- **Descripción**: Inicia el proceso de scraping para actualizar herramientas
- **Parámetros**: Ninguno
- **Respuesta**: Confirmación de inicio del proceso

### Endpoints de Sugerencias para Usuarios

#### GET `/user-tool-suggestions`
- **Descripción**: Obtiene sugerencias de herramientas para un usuario
- **Parámetros**:
  - Token de autenticación (header)
- **Respuesta**: Lista de herramientas recomendadas

## 2. Aplicación Backoffice (apps/backoffice)

### Endpoints de Administración de Herramientas

#### POST `/admin/tool`
- **Descripción**: Crea una nueva herramienta
- **Parámetros**:
  - Datos de la herramienta en el cuerpo de la petición
- **Respuesta**: Objeto de la herramienta creada

#### PUT `/admin/tool/:id`
- **Descripción**: Actualiza una herramienta existente
- **Parámetros**:
  - `id` (path, obligatorio): ID de la herramienta
  - Datos a actualizar en el cuerpo de la petición
- **Respuesta**: Objeto de la herramienta actualizada

#### DELETE `/admin/tool/:id`
- **Descripción**: Elimina una herramienta
- **Parámetros**:
  - `id` (path, obligatorio): ID de la herramienta
- **Respuesta**: Confirmación de eliminación

### Endpoints de Futurpedia

#### GET `/futurpedia/test`
- **Descripción**: Endpoint de prueba para la integración con Futurpedia
- **Parámetros**: Ninguno
- **Respuesta**: Datos de prueba o confirmación

## 3. Servicios Comunes

### Endpoints de Autenticación

#### POST `/auth/login`
- **Descripción**: Inicia sesión de usuario
- **Parámetros**:
  - `email` (body, obligatorio): Correo electrónico
  - `password` (body, obligatorio): Contraseña
- **Respuesta**: Token de autenticación y datos de usuario

#### POST `/auth/register`
- **Descripción**: Registra un nuevo usuario
- **Parámetros**:
  - Datos de registro en el cuerpo de la petición
- **Respuesta**: Confirmación de registro y posiblemente token

#### GET `/web/auth/me`
- **Descripción**: Obtiene el perfil del usuario autenticado actual
- **Parámetros**:
  - Token de autenticación (header)
- **Respuesta**: Datos del perfil de usuario
- **Formato de Respuesta (DTO)**:
  ```json
  {
    "id": "string",            // ID único del usuario
    "visitedTools": "string",  // JSON stringificado con las herramientas visitadas
    "favorites": "string",     // JSON stringificado con los IDs de herramientas favoritas
    "email": "string",         // Correo electrónico del usuario
    "name": "string",          // Nombre del usuario
    "suggestions": "string"    // JSON stringificado con sugerencias de herramientas
  }
  ```

### Endpoints de Usuario

#### GET `/user/profile`
- **Descripción**: Obtiene el perfil del usuario actual
- **Parámetros**:
  - Token de autenticación (header)
- **Respuesta**: Datos del perfil de usuario

#### PUT `/user/profile`
- **Descripción**: Actualiza el perfil del usuario
- **Parámetros**:
  - Token de autenticación (header)
  - Datos a actualizar en el cuerpo de la petición
- **Respuesta**: Perfil actualizado

---