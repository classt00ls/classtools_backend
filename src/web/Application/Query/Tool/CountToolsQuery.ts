import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";

/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class CountToolsQuery {
    constructor(
        public filter: FilterDto
    ){}
}