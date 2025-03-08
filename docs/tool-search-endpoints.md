# Tool Search API Endpoints

## Endpoints

### 1. Búsqueda General de Herramientas
- **URL**: `GET /tool/search`
- **Descripción**: Busca herramientas aplicando filtros y paginación
- **Parámetros Query**:
  - `page`: Número de página (número)
  - `pageSize`: Tamaño de la página (número)
  - `filters`: Objeto con los siguientes filtros opcionales:
    - `prompt`: Texto de búsqueda (string)
    - `selectedCategories`: Categorías seleccionadas (array de strings)
    - `stars`: Filtro por estrellas (número)
    - `title`: Filtro por título (string)
- **Respuesta**:
  ```json
  {
    "data": [...], // Array de herramientas
    "count": 0    // Total de resultados (0 si hay prompt)
  }
  ```

### 2. Búsqueda de Herramientas por Idioma
- **URL**: `GET /tool/search/lang`
- **Descripción**: Similar a la búsqueda general pero permite especificar el idioma de los resultados
- **Parámetros Query**:
  - `page`: Número de página (número)
  - `pageSize`: Tamaño de la página (número)
  - `filters`: Objeto con los siguientes filtros opcionales:
    - `prompt`: Texto de búsqueda (string)
    - `selectedCategories`: Categorías seleccionadas (array de strings)
    - `stars`: Filtro por estrellas (número)
    - `title`: Filtro por título (string)
    - `lang`: Idioma de los resultados (string, ej: 'es', 'en')
- **Respuesta**:
  ```json
  {
    "data": [...], // Array de herramientas en el idioma especificado
    "count": 0    // Total de resultados (0 si hay prompt)
  }
  ```

### 3. Endpoint de Scraping (Desarrollo)
- **URL**: `GET /tool/search/scrap`
- **Descripción**: Endpoint de prueba para ejecutar el scraping de URLs
- **Respuesta**: 'OK' si el proceso se completa correctamente

## Ejemplos de Uso

### Búsqueda General
```
GET /tool/search?page=1&pageSize=10&filters[prompt]=ia&filters[stars]=4
```

### Búsqueda por Idioma
```
GET /tool/search/lang?page=1&pageSize=10&filters[lang]=es&filters[prompt]=ia
```

### Búsqueda con Categorías
```
GET /tool/search?page=1&pageSize=10&filters[selectedCategories]=marketing,seo
```

## Notas
- Todos los endpoints están protegidos con `PublicGuard`
- Se utiliza validación de parámetros y transformación automática
- La respuesta está serializada usando `ToolsSearchResponse`
- El conteo total (`count`) será 0 cuando se use el filtro `prompt` 