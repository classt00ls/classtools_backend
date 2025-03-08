import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";

/**
 * @description Filtra las tools por idioma usando los parámetros genéricos (page, pagesize, ...) y los parámetros de búsqueda
 * @param page Número de página
 * @param pageSize Tamaño de la página
 * @param filter Filtros a aplicar, incluyendo el idioma
 */
export class GetFilteredToolsByLangQuery {
    constructor(
        public page: number,
        public pageSize: number,
        public filter: FilterDto
    ){}

    public getSuffix(): string {
        return this.filter.lang ? `_${this.filter.lang}` : '';
    }
} 