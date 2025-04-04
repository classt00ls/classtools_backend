<think>Parece que hubo un problema con la función de edición de archivo. El error indica que la función fue interrumpida o no devolvió resultados. Debo responder al usuario y explicar la situación.

El usuario está preguntando si estoy bien, lo que sugiere que notó que algo salió mal con mi intento anterior de editar el archivo. Debo confirmar que estoy funcionando y explicar que hubo un problema técnico con la herramienta de edición.

También debo volver a la solicitud original del usuario, que era revisar las instrucciones para implementar un nuevo idioma, pero enfocándolas más como instrucciones claras para una IA que necesite generarlas.</think>Sí, estoy bien. Parece que hubo un problema técnico con la herramienta de edición del archivo. Voy a continuar con tu solicitud sin usar la herramienta de edición por ahora.

Revisaré la guía de implementación de un nuevo idioma, adaptándola para que sea más clara como instrucciones para una IA:

# Instrucciones para Implementar un Nuevo Idioma en ClassTools (Optimizado para IA)

## 1. Crear estructura de base de datos

Para implementar un nuevo idioma (ejemplo: francés - 'fr'):

1. Genera el SQL para crear la tabla principal del nuevo idioma:
   - Usa exactamente la misma estructura que las tablas existentes (tool_es, tool_en)
   - Mantén todos los campos: id, created_at, updated_at, deleted_at, name, description, excerpt, etc.
   - Nombra la tabla como tool_[código_idioma] (ej: tool_fr)
   - Incluye restricciones de clave primaria e índices

2. Genera el SQL para la tabla de relaciones:
   - Crea una tabla de unión para la relación many-to-many con tags
   - Nombra la tabla como tool_tag_[código_idioma] (ej: tool_tag_fr)
   - Define claves foráneas apropiadas

3. Crea índices para optimizar las consultas más frecuentes:
   - Índice para el campo name
   - Índice para el campo status

## 2. Actualizar código de repositorios

1. Identifica todas las clases que inicializan repositorios con idiomas específicos:
   - Busca todas las instancias de ToolTypeormRepository 
   - Revisa especialmente: ToolCreator, ToolUpdater, GetFilteredToolsByLangQueryHandler, etc.

2. En cada constructor o factory, añade el nuevo idioma:
   - Sigue el patrón existente para los idiomas actuales
   - Utiliza el sufijo correcto (_fr) para el nuevo repositorio
   - Verifica que el formato de los sufijos sea consistente

## 3. Modificar detección de idioma

1. Actualiza constantes de idiomas soportados:
   - Busca arreglos o enums de idiomas soportados (SUPPORTED_LANGUAGES)
   - Añade el nuevo código de idioma

2. Modifica middleware/interceptores de detección:
   - Identifica la lógica que extrae el idioma de las peticiones
   - Añade soporte para el nuevo idioma en los validadores
   - Actualiza la lógica de idioma por defecto si es necesario

3. Actualiza configuración de rutas si usan prefijos de idioma:
   - Busca definiciones de rutas basadas en idioma
   - Añade la nueva configuración siguiendo el patrón existente

## 4. Actualizar interfaz de usuario

1. Modifica selectores de idioma:
   - Añade la nueva opción con el código y nombre del idioma
   - Mantén el formato usado para los idiomas existentes

2. Crea archivo de traducción para textos estáticos:
   - Copia la estructura de los archivos existentes
   - Traduce todos los textos al nuevo idioma
   - Nombra el archivo según la convención (ej: fr.json)

## 5. Implementar migración de datos

1. Crea un script de migración que:
   - Obtenga todos los datos desde un idioma existente (preferiblemente completo)
   - Mantenga los mismos IDs para mantener relaciones
   - Traduzca los campos de texto (nombre, descripción, etc.)
   - Mantenga las relaciones con otras entidades (tags, etc.)
   - Implemente manejo de errores y logging
   - Use transacciones para garantizar consistencia

## 6. Integrar servicio de traducción

1. Implementa o adapta un servicio de traducción:
   - Integra una API externa (Google Translate, DeepL)
   - Añade caché para optimizar rendimiento
   - Implementa mecanismos de fallback
   - Añade el nuevo par de idiomas a las opciones de traducción

2. Crea listeners para sincronización:
   - Implementa listeners para eventos de cambio en contenido
   - Propaga cambios automáticamente entre idiomas

## 7. Adaptar servicios de búsqueda

1. Actualiza servicios que gestionan búsquedas:
   - Añade el nuevo repositorio a los mapas de repositorios por idioma
   - Asegúrate que la validación de idiomas incluya el nuevo código
   - Actualiza la lógica de búsqueda para el nuevo idioma

## 8. Implementar lógica de fallback

1. Modifica servicios para manejar contenido no existente:
   - Implementa lógica para detectar contenido faltante en el idioma solicitado
   - Configura un idioma de fallback (generalmente inglés)
   - Añade logging para identificar contenido faltante

## 9. Desarrollar pruebas

1. Crea conjuntos de pruebas específicos:
   - Tests unitarios para repositorios del nuevo idioma
   - Tests de integración para la API
   - Tests para caracteres especiales del idioma
   - Pruebas de rendimiento específicas

## 10. Actualizar documentación y mensajes

1. Añade traducciones para:
   - Mensajes de error del sistema
   - Textos de ayuda y guías
   - Documentación técnica y de usuario
   - Plantillas de email o notificaciones

## 11. Optimizar SEO

1. Implementa etiquetas para motores de búsqueda:
   - Añade etiquetas hreflang para vincular versiones de idiomas
   - Actualiza metadatos específicos por idioma (títulos, descripciones)
   - Configura URLs con prefijo de idioma para el nuevo idioma

## 12. Configurar monitoreo

1. Implementa métricas específicas:
   - Añade el nuevo idioma a contadores de uso
   - Configura alertas para problemas específicos
   - Implementa dashboards para seguimiento de adopción
   - Prepara sistemas para recopilar feedback de usuarios
   
