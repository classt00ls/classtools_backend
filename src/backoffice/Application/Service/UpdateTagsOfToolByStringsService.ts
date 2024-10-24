import { Injectable } from '@nestjs/common';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';
import { ToolRepository } from 'src/Shared/Domain/Repository/tool.repository';

@Injectable()
export class UpdateTagsOfToolByStringsService {

    constructor(
        private toolRepository: ToolRepository,
        private tagRepository: TagRepository
        ) {}
    
    async execute(
        toolId: string,
        tags: Array<string>
    ) {

        try {
            const tool = await this.toolRepository.getOneByIdOrFail(toolId);
            const allTagsToAdd = [];
                
            for(let tag of tags) {
                let new_tag;
                // Evitem els duplicats
                try {
                    // Quan existeix el tag pasem al catch i no el creem
                    new_tag = await this.tagRepository.getOneByNameOrFail(tag);
                    allTagsToAdd.push(new_tag);
                } catch (error) {
                }
            }

            tool.tags = allTagsToAdd;
            const toolSaved = await this.toolRepository.save(tool);

            return allTagsToAdd;
            
        } catch (error) {
            // En este caso si el tool ya existe no hacemos nada
        }
        
    }
}