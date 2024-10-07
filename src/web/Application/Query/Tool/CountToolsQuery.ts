
/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class CountToolsQuery {
    constructor(
        public tags: string[] = [],
        public stars: number = 0
    ){}
}