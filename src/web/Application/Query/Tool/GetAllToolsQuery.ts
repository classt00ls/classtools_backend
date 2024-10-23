
/**
 * @description Recupera todas las IA desde la home de futurpedia
 * @return {} response
 */
export class GetAllToolsQuery {
    constructor(
        public page: number,
		public pageSize: number
    ){}
}