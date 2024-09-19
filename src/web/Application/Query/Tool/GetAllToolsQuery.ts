
/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class GetAllToolsQuery {
    constructor(
        public page: number,
		public pageSize: number
    ){}
}