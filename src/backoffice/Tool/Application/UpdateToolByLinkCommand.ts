/**
 * @description Actualiza una IA
 */
export class UpdateToolByLinkCommand {
    constructor(
        public link: string,
        public lang: string = 'es'
    ){}
}