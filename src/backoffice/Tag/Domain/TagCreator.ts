import { Injectable } from "@nestjs/common";
import { TagRepository } from "@Backoffice/Tag/Domain/tag.repository";
import { v6 as uuidv6 } from 'uuid';
import { TagModel } from "./Tag.model";

@Injectable()
export class TagCreator {

    constructor(private tagRepository: TagRepository) {}

    public async extract(tags: string[]): Promise<TagModel[]> {

        const allTagsToAdd = [];
                
            for(let tag of tags) {
                let new_tag;
                // Evitem els duplicats
                try {
                    // Quan existeix el tag pasem al catch i no el creem
                    await this.tagRepository.getOneByNameAndFail(tag);

                    new_tag = await this.tagRepository.create(
                        {
                            id: uuidv6(),
                            name: tag
                        }
                    );

                    await this.tagRepository.insert(new_tag);
                    
                } catch (error) {
                    new_tag = await this.tagRepository.getOneByNameOrFail(tag);
                }

                allTagsToAdd.push(new_tag);
            }

            return allTagsToAdd;
    }
}