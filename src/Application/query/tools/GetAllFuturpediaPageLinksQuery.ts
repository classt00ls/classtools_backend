import { IsEmail, IsString } from "class-validator";

/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class GetAllFuturpediaPageLinksQuery {
    constructor(
        public route:string
    ){}
}