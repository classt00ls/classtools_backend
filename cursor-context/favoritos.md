# Gestión de Favoritos en ClassTools

Este documento describe el proceso completo para implementar la gestión de favoritos de herramientas en la aplicación ClassTools, desde la estructura de datos hasta la implementación del frontend.

## Índice
- [Estructura de Datos](#estructura-de-datos)
- [Flujo de Funcionamiento](#flujo-de-funcionamiento)
- [Proceso de Implementación](#proceso-de-implementación)
- [API Endpoints](#api-endpoints)
- [Implementación Frontend](#implementación-frontend)
- [Pruebas](#pruebas)

## Estructura de Datos

### Modelo de Usuario (UserWeb)

En el modelo de usuario, los favoritos se almacenan como un string JSON que contiene un array de IDs de herramientas:

```typescript
// src/web/UserWeb/Domain/UserWeb.ts
export class UserWeb extends AggregateRoot {
  constructor(
    public readonly id: UserWebId,
    public visitedTools: string,
    public favorites: string,  // Array de IDs de herramientas en formato JSON
    public email: string,
    public name: string,
    public suggestions: string
  ) {
    super();
  }
  
  // Método para convertir a primitivos
  toPrimitives(): UserWebPrimitives {
    return {
      id: this.id.value,
      visitedTools: this.visitedTools,
      favorites: this.favorites,  // Se devuelve como string JSON
      email: this.email,
      name: this.name,
      suggestions: this.suggestions
    };
  }
}
```

### Base de Datos

La tabla `userweb` en la base de datos contiene una columna `favorites` que almacena el string JSON:

```sql
CREATE TABLE IF NOT EXISTS "userweb" (
  "id" varchar PRIMARY KEY NOT NULL, 
  "favorites" varchar NOT NULL, 
  "visited_tools" varchar, 
  "email" varchar, 
  "name" varchar, 
  "suggestions" varchar
);
```

## Flujo de Funcionamiento

El proceso de gestión de favoritos sigue estos pasos:

1. **Obtención del perfil**: El cliente solicita los datos del usuario autenticado mediante el endpoint `/web/auth/me`.
2. **Parseo de favoritos**: El cliente recibe los favoritos como un string JSON y lo parsea a un array de IDs.
3. **Toggle de favoritos**: El cliente puede añadir/quitar favoritos mediante el endpoint `/tool/favorite`.
4. **Visualización de herramientas**: Al mostrar herramientas, se marca la propiedad `isBookmarked` como `true` si la herramienta está en la lista de favoritos del usuario.

## Proceso de Implementación

### Backend

#### 1. Endpoint para obtener perfil de usuario

```typescript
// apps/web/auth/web-auth.controller.ts
@Get('me')
@UseGuards(TokenAuthGuard)
async me(@Request() req) {
  const userWeb = await this.userRepository.search(
    new UserWebId(req.userId)
  );
  return userWeb.toPrimitives();
}
```

#### 2. Método para alternar favoritos

```typescript
// src/web/UserWeb/Domain/UserWeb.ts
toggleFavorite(favoriteTool: string): void {
  let favorites = [];
  
  if (this.favorites) {
    try {
      favorites = JSON.parse(this.favorites);
    } catch (error) {
      favorites = [];
    }
  }
  
  const index = favorites.indexOf(favoriteTool);

  if (index === -1) {
    favorites.push(favoriteTool);
  } else {
    favorites.splice(index, 1);
  }

  this.favorites = JSON.stringify(favorites);
}
```

#### 3. Endpoint para alternar favoritos

```typescript
// apps/web/Tool/tool.controller.ts
@Get('favorite')
@UseGuards(TokenAuthGuard)
async favorite(
  @Request() request,
  @Query('id') id: string,
) {
  const userId = request.userId;

  const data = await this.queryBus.execute(
    new ToggleFavoriteCommand(
      userId,
      id
    )
  );

  return data;
}
```

#### 4. Servicio para alternar favoritos

```typescript
// src/web/UserWeb/Domain/ToogleFavorite.ts
@Injectable()
export class ToogleFavorite {
  constructor(
    private repository: UserWebRepository
  ) {}

  public async execute(
    userId: UserWebId,
    toolId: string
  ): Promise<void> {
    const user = await this.repository.search(userId);
    user.toggleFavorite(toolId);

    await this.repository.save(user);
  }
}
```

#### 5. Manejador del comando de alternar favoritos

```typescript
// src/web/UserWeb/Application/ToggleFavoriteCommandHandler.ts
@QueryHandler(ToggleFavoriteCommand)
@Injectable()
export class ToggleFavoriteCommandHandler {
  constructor(
    private toggler: ToogleFavorite
  ) {}

  async execute(command: ToggleFavoriteCommand) {
    return await this.toggler.execute(
      new UserWebId(command.userId),
      command.toolId
    );
  }
}
```

### Frontend

#### 1. Recuperar los datos del usuario

```typescript
// Ejemplo en un servicio de autenticación
async getUserProfile() {
  const response = await this.http.get('/web/auth/me').toPromise();
  
  // Parsear favoritos desde string JSON a array
  if (response.favorites) {
    this.userFavorites = JSON.parse(response.favorites);
  } else {
    this.userFavorites = [];
  }
  
  return response;
}
```

#### 2. Comprobar si una herramienta es favorita

```typescript
// Ejemplo en un componente de herramienta
isToolFavorite(toolId: string): boolean {
  return this.userFavorites.includes(toolId);
}
```

#### 3. Alternar favorito

```typescript
// Ejemplo en un servicio de herramientas
async toggleFavorite(toolId: string) {
  await this.http.get(`/tool/favorite?id=${toolId}`).toPromise();
  
  // Actualizar lista local de favoritos
  const index = this.userFavorites.indexOf(toolId);
  if (index === -1) {
    this.userFavorites.push(toolId);
  } else {
    this.userFavorites.splice(index, 1);
  }
  
  // Emitir evento para actualizar UI
  this.favoritesChanged.emit(this.userFavorites);
}
```

#### 4. Marcar herramientas favoritas en listados

Para cada herramienta en un listado, debes asignar la propiedad `isBookmarked`:

```typescript
// Ejemplo en un componente de listado de herramientas
prepareToolsForDisplay(tools: Tool[]) {
  return tools.map(tool => {
    return {
      ...tool,
      isBookmarked: this.userFavorites.includes(tool.id)
    };
  });
}
```

## API Endpoints

### GET `/web/auth/me`

- **Descripción**: Obtiene el perfil del usuario autenticado, incluyendo sus favoritos
- **Respuesta**:
  ```json
  {
    "id": "string",
    "visitedTools": "string",  // JSON stringificado
    "favorites": "string",     // JSON stringificado, array de IDs
    "email": "string",
    "name": "string",
    "suggestions": "string"    // JSON stringificado
  }
  ```

### GET `/tool/favorite`

- **Descripción**: Alterna el estado de favorito de una herramienta
- **Parámetros**:
  - `id` (query, obligatorio): ID de la herramienta
- **Autenticación**: Requiere token de autenticación
- **Respuesta**: Vacío (status 200 OK)

## Implementación Frontend

### Componente de Botón Favorito

```typescript
@Component({
  selector: 'app-favorite-button',
  template: `
    <button (click)="toggleFavorite()" [class.active]="isBookmarked">
      <i class="fa" [class.fa-heart]="isBookmarked" [class.fa-heart-o]="!isBookmarked"></i>
    </button>
  `
})
export class FavoriteButtonComponent {
  @Input() toolId: string;
  @Input() isBookmarked: boolean;
  
  constructor(private toolService: ToolService) {}
  
  toggleFavorite() {
    this.toolService.toggleFavorite(this.toolId);
  }
}
```

### Servicio de Gestión de Favoritos

```typescript
@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favorites: string[] = [];
  favoritesChanged = new EventEmitter<string[]>();
  
  constructor(private authService: AuthService, private http: HttpClient) {
    this.loadFavorites();
  }
  
  private async loadFavorites() {
    const user = await this.authService.getUserProfile();
    if (user && user.favorites) {
      try {
        this.favorites = JSON.parse(user.favorites);
        this.favoritesChanged.emit(this.favorites);
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }
  
  isFavorite(toolId: string): boolean {
    return this.favorites.includes(toolId);
  }
  
  async toggleFavorite(toolId: string) {
    await this.http.get(`/tool/favorite?id=${toolId}`).toPromise();
    
    const index = this.favorites.indexOf(toolId);
    if (index === -1) {
      this.favorites.push(toolId);
    } else {
      this.favorites.splice(index, 1);
    }
    
    this.favoritesChanged.emit(this.favorites);
  }
  
  getFavorites(): string[] {
    return [...this.favorites];
  }
}
```

## Pruebas

### Pruebas Unitarias

1. **Probar el método toggleFavorite**:
   - Comprobar que añade un ID cuando no existe
   - Comprobar que elimina un ID cuando ya existe
   - Comprobar que maneja correctamente JSON malformado

2. **Probar el servicio ToogleFavorite**:
   - Comprobar que recupera el usuario correcto
   - Comprobar que llama a toggleFavorite con el ID correcto
   - Comprobar que guarda el usuario después de la modificación

### Pruebas de Integración

1. **Probar el endpoint /web/auth/me**:
   - Verificar que devuelve la estructura correcta con favorites
   - Verificar que maneja correctamente la autenticación

2. **Probar el endpoint /tool/favorite**:
   - Verificar que alterna correctamente el estado de favorito
   - Verificar que requiere autenticación
   - Verificar que maneja errores adecuadamente

### Pruebas E2E

1. Iniciar sesión en la aplicación
2. Verificar que se muestran los favoritos correctamente
3. Añadir una herramienta a favoritos y verificar que se actualiza la UI
4. Eliminar una herramienta de favoritos y verificar que se actualiza la UI
5. Recargar la página y verificar que los cambios persisten 