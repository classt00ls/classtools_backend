
/**
 * @description Filtra las tools por los parámetros genéricos (page, pagesize, ...) y además por los parámetros de busqueda propios de las tools:
 * @description tags y stars 
 * @param page 
 * @param pageSize 
 * @param tags 
 * @param stars 
 */
export class GetFilteredToolsQuery {
    constructor(
        public page: number,
        public pageSize: number,
        public tags: string[],
        public stars: number
    ){}
}