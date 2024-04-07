import { IsEmail, IsString } from "class-validator";

/**
 * @description Recupera todas las IA desde la home de futurpedia
 */
export class ImportToolByLinkCommand {
    constructor(
        public link: string
    ){}
}