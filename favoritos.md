# Guía para procesar favoritos en ClassTools con CursorAI

Este documento proporciona instrucciones paso a paso para que una IA como CursorAI implemente la recuperación y procesamiento de herramientas favoritas en ClassTools, partiendo de un array de IDs de favoritos ya existente.

## Punto de partida

Asumimos que ya tenemos:
- Un array `favoriteIds` con los IDs de las herramientas favoritas del usuario
- Este array se ha obtenido parseando la respuesta JSON del endpoint `/web/auth/me`

## Recuperación de herramientas favoritas

### 1. Llamadas a la API necesarias

Para recuperar las herramientas favoritas, debes hacer lo siguiente:

```typescript
// Opción 1: Recuperar todas las herramientas y filtrar por favoritos (frontend)
async function getFavoriteTools() {
  // Llamada al endpoint para obtener todas las herramientas
  const response = await fetch('/tool?page=1&pageSize=100');
  const { data, count } = await response.json();
  
  // Filtrar solo las herramientas favoritas
  const favoriteTools = data.filter(tool => favoriteIds.includes(tool.id));
  
  return favoriteTools;
}

// Opción 2: Recuperar cada herramienta favorita individualmente
async function getFavoriteToolDetails() {
  const promises = favoriteIds.map(id => 
    fetch(`/tool/detail?id=${id}`).then(res => res.json())
  );
  
  const favoriteTools = await Promise.all(promises);
  return favoriteTools;
}
```

### 2. Procesamiento de resultados

Al obtener las herramientas, marca cada una como favorita:

```typescript
function markFavoritedTools(tools) {
  return tools.map(tool => ({
    ...tool,
    isBookmarked: true  // Ya sabemos que todas están en favoritos
  }));
}
```

## Implementación en diferentes escenarios

### Escenario 1: Página de favoritos

Para implementar una página que muestre solo los favoritos:

```typescript
async function renderFavoritesPage() {
  // 1. Obtener las herramientas favoritas
  const favoriteTools = await getFavoriteTools();
  
  // 2. Marcar todas como favoritas
  const markedTools = markFavoritedTools(favoriteTools);
  
  // 3. Renderizar las herramientas
  renderToolsList(markedTools);
}
```

### Escenario 2: Marcar favoritos en una lista existente

Para marcar favoritos en una lista de herramientas ya cargada:

```typescript
function markFavoritesInExistingList(allTools) {
  return allTools.map(tool => ({
    ...tool,
    isBookmarked: favoriteIds.includes(tool.id)
  }));
}
```

### Escenario 3: Actualizar favoritos en tiempo real

Cuando un usuario marca/desmarca un favorito:

```typescript
async function toggleFavorite(toolId) {
  // 1. Llamar al API para alternar el favorito en el backend
  await fetch(`/tool/favorite?id=${toolId}`);
  
  // 2. Actualizar el array local de favoritos
  const index = favoriteIds.indexOf(toolId);
  if (index === -1) {
    favoriteIds.push(toolId);
  } else {
    favoriteIds.splice(index, 1);
  }
  
  // 3. Actualizar la UI para reflejar el cambio
  updateToolDisplay(toolId);
}
```

## Manejo de estados en aplicaciones complejas

En aplicaciones con gestión de estado (Redux, Context API, etc.):

```typescript
// Ejemplo con React Context
function useFavorites() {
  const { favoriteIds } = useContext(UserContext);
  const [favoriteTools, setFavoriteTools] = useState([]);
  
  useEffect(() => {
    async function loadFavoriteTools() {
      // Usando la opción 1 de arriba
      const response = await fetch('/tool?page=1&pageSize=100');
      const { data } = await response.json();
      
      const favorites = data.filter(tool => favoriteIds.includes(tool.id))
                            .map(tool => ({...tool, isBookmarked: true}));
      
      setFavoriteTools(favorites);
    }
    
    loadFavoriteTools();
  }, [favoriteIds]);
  
  return favoriteTools;
}
```

## Optimizaciones recomendadas

1. **Caché local**: Mantén un caché de herramientas para evitar múltiples peticiones API:

```typescript
const toolsCache = new Map();

async function getToolWithCache(toolId) {
  if (toolsCache.has(toolId)) {
    return toolsCache.get(toolId);
  }
  
  const response = await fetch(`/tool/detail?id=${toolId}`);
  const tool = await response.json();
  
  toolsCache.set(toolId, tool);
  return tool;
}
```

2. **Paginación**: Si hay muchos favoritos, implementa paginación:

```typescript
async function getFavoriteToolsPaginated(page = 1, pageSize = 10) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const pageIds = favoriteIds.slice(startIndex, endIndex);
  
  const promises = pageIds.map(id => 
    fetch(`/tool/detail?id=${id}`).then(res => res.json())
  );
  
  const pageTools = await Promise.all(promises);
  return {
    data: pageTools,
    totalPages: Math.ceil(favoriteIds.length / pageSize),
    currentPage: page
  };
}
```

## Ejemplos prácticos para CursorAI

### 1. Implementar una función para buscar herramientas específicas entre favoritos

```typescript
async function searchInFavorites(searchTerm) {
  // 1. Obtenemos todas las herramientas favoritas
  const favoriteTools = await getFavoriteTools();
  
  // 2. Filtramos por el término de búsqueda
  return favoriteTools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
```

### 2. Agrupar favoritos por categoría

```typescript
async function groupFavoritesByCategory() {
  const favoriteTools = await getFavoriteTools();
  
  return favoriteTools.reduce((groups, tool) => {
    const category = tool.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tool);
    return groups;
  }, {});
}
```

### 3. Verificar si todas las herramientas de una categoría están en favoritos

```typescript
async function isEntireCategoryFavorited(categoryId) {
  const response = await fetch(`/tool/search?page=1&pageSize=100&filters={"category":${categoryId}}`);
  const { data } = await response.json();
  
  // Comprobar si todos los IDs de herramientas de la categoría están en favoritos
  return data.every(tool => favoriteIds.includes(tool.id));
}
```

### 4. Exportar lista de favoritos

```typescript
async function exportFavorites(format = 'json') {
  const favoriteTools = await getFavoriteTools();
  
  switch (format) {
    case 'json':
      return JSON.stringify(favoriteTools, null, 2);
    case 'csv':
      const headers = 'ID,Name,URL,Description\n';
      const rows = favoriteTools.map(tool => 
        `${tool.id},"${tool.name}","${tool.url}","${tool.description.replace(/"/g, '""')}"`
      ).join('\n');
      return headers + rows;
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}
```

## Resumen de API Endpoints necesarios

1. **GET `/tool`**: Obtiene todas las herramientas (con paginación).
   - Parámetros: `page`, `pageSize`
   - Respuesta: `{ data: [...herramientas], count: número_total }`

2. **GET `/tool/detail`**: Obtiene una herramienta específica por ID.
   - Parámetros: `id` (obligatorio), `lang` (opcional)
   - Respuesta: Objeto detallado de herramienta

3. **GET `/tool/favorite`**: Alterna el estado de favorito.
   - Parámetros: `id` (obligatorio)
   - Requiere autenticación
   - Respuesta: 200 OK

4. **GET `/tool/search`**: Busca herramientas con filtros.
   - Parámetros: `page`, `pageSize`, `filters` (objeto JSON stringify)
   - Respuesta: `{ data: [...herramientas], count: número_filtrado }` 