
import { Injectable } from "@nestjs/common";
import { ToolRepository } from "src/Shared/Domain/Repository/tool.repository";
import { ToolVectorRepository } from "@Web/Tool/Domain/tool.vector.repository";


@Injectable()
export class ToolVectorSearcher {
    constructor(
        private readonly toolRepository: ToolRepository,
        private readonly toolVectorRepository: ToolVectorRepository
    ) {}
    
    async search(
        prompt: string
    ) {

        try {

            const result = await this.toolVectorRepository.search(prompt);
            
            const response = await Promise.all(result.map(this.format)); 

            return response;
            
        } catch(error) {

        }
    }

    private format = async (result) => {

        return await this.toolRepository.getOne(result.id);
        
        // return {
        //     id: result.id,
        //     name: tool.name,
        //     url: tool.url,
        //     // reason: result.reason,
        //     excerpt: tool.excerpt
        // };
        
    }
}