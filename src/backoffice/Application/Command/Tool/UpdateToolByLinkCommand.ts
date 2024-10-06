import { IsEmail, IsString } from "class-validator";

/**
 * @description Actualiza una IA
 */
export class UpdateToolByLinkCommand {
    constructor(
        public link: string
    ){}
}