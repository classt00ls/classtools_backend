import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";

export class GetFavoriteToolsQuery {
    constructor(
        public userId: string,
        public lang: string = 'es',
        public page: number = 1,
        public pageSize: number = 15
    ){}
} 