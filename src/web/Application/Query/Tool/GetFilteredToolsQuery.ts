

export class GetFilteredToolsQuery {
    constructor(
        public page: number,
        public pageSize: number,
        public tags: string[],
        public stars: number
    ){}
}