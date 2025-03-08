import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";

/**
 * @description Cuenta las herramientas aplicando los filtros y usando el idioma especificado
 * @param filter Filtros a aplicar, incluyendo el idioma
 */
export class CountToolsByLangQuery {
    constructor(
        public filter: FilterDto
    ){}

    public getSuffix(): string {
        return this.filter.lang ? `_${this.filter.lang}` : '';
    }
} 