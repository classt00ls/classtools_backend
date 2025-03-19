export class GetToolBySlugQuery {
    constructor(
        public slug: string,
        public userId?: string,
        public lang?: string
    ){}
} 