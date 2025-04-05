
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "@Backoffice/Tool/Domain/tool.repository";
import { ToolFilter } from "@Web/Tool/Domain/tool.filter";


@Injectable()
export class ToolSearcher {
    constructor(
        private readonly toolRepository: ToolRepository
    ) {}
    
    async search(
        selectedCategories: string[],
        stars,
        title,
        page,
        pageSize
    ) {

        return await this.toolRepository.getAll(
            new ToolFilter(
                selectedCategories,
                stars,
                title,
                page,
                pageSize
            )
        );
        
    }
}