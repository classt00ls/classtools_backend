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

#### GET `/tool`
- **Descripción**: Obtiene todas las herramientas
- **Parámetros**: 
  - Parámetros de paginación probablemente
- **Respuesta**: Lista de herramientas

#### GET `/tool/:id`
- **Descripción**: Obtiene una herramienta por su ID
- **Parámetros**:
  - `id` (path, obligatorio): ID de la herramienta
- **Respuesta**: Objeto detallado de la herramienta

### Endpoints de Búsqueda de Herramientas

#### GET `/tool/search`
- **Descripción**: Busca herramientas con filtros específicos
- **Parámetros**:
  - `page` (query, opcional): Número de página
  - `pageSize` (query, opcional): Tamaño de página
  - `filters` (query, opcional): Objeto con filtros (categorías, estrellas, título, etc.)
- **Respuesta**: Objeto con datos de herramientas y recuento total

#### GET `/tool/search/lang`
- **Descripción**: Busca herramientas en un idioma específico
- **Parámetros**:
  - `page` (query, opcional): Número de página
  - `pageSize` (query, opcional): Tamaño de página
  - `filters` (query, opcional): Objeto con filtros
  - `lang` (query, obligatorio): Idioma de búsqueda
- **Respuesta**: Objeto con datos de herramientas y recuento total

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