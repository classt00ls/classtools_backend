import { Injectable } from '@nestjs/common';
import { TagRepository } from 'src/Shared/Domain/Repository/tag.repository';

@Injectable()
export class CreateOnlyNewTagsService {

    constructor(
        private tagRepository: TagRepository
        ) {}
    
    async execute(
        tags: Array<string>
    ) {
        const allTagsAdded = [];

        try {
            for(let tag of tags) {
                let new_tag;
                // Evitem els duplicats
                try {
                    // Quan existeix el tag pasem al catch i no el creem
                    await this.tagRepository.getOneByNameAndFail(tag);

                    new_tag = await this.tagRepository.create(
                        {
                            name: tag
                        }
                    );

                    await this.tagRepository.insert(new_tag);
                    allTagsAdded.push(new_tag);
                    
                } catch (error) {
                }

                
            }

            return allTagsAdded;

        } catch (error) {
            // En este caso si el tool ya existe no hacemos nada
        }
        
    }
}