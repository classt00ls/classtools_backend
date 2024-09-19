
/**
 * @description Convierte un tag en categoria
 */
export class UpdateTagCommand {
    constructor(
        public tagId: string,
        public excerpt: string,
        public imageUrl: string,
        public name: string
    ){}
}