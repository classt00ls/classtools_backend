/**
 * Tipo genérico para respuestas multiidioma
 * T es el tipo de la respuesta que se devolverá en cada idioma
 */
export type MultiLanguageResponse<T> = {
    es: T;
    en: T;
}; 