import { FilterDto } from "../../Dto/Tool/filterTools.dto";


export class GetSuggestedToolsQuery {
    constructor(
        public suggestions: string
    ){}
}