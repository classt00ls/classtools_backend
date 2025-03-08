import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";

/**
 * @description Recupera todas las IA desde la home de futurpedia
 * @param filter Filtros a aplicar
 * @param suffix Sufijo para la tabla (_es, _en, etc)
 */
export class CountToolsQuery {
    constructor(
        public filter: FilterDto,
        public suffix: string = ''
    ){}
}