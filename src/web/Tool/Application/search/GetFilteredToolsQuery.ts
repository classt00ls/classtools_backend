import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";


/**
 * @description Filtra las tools por los parámetros genéricos (page, pagesize, ...) y además por los parámetros de busqueda propios de las tools:
 * @description tags y stars 
 * @param page 
 * @param pageSize 
 * @param filter
 * @param suffix Sufijo para la tabla (_es, _en, etc)
 */
export class GetFilteredToolsQuery {
    constructor(
        public page: number,
        public pageSize: number,
        public filter: FilterDto,
        public suffix: string = ''
    ){}
}