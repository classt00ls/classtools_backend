import { IsEmail, IsString } from "class-validator";

/**
 * @description Recupera todas las IA desde el link proporcionado (esta preparado para futurpedia)
 */
export class ImportToolByLinkCommand {
    constructor(
        public link: string
    ){}
}