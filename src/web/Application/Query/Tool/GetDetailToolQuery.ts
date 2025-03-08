/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class GetDetailToolQuery {
    constructor(
        public id: string,
        public userId?: string,
        public lang: string = 'es'
    ){}
}