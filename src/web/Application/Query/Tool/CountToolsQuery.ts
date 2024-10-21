import { FilterDto } from "../../Dto/Tool/filterTools.dto";

/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class CountToolsQuery {
    constructor(
        public filter: FilterDto
    ){}
}