import { Injectable } from "@nestjs/common";
import { UserWebCreatorRequest } from "../../Request/UserWeb/UserWebCreatorRequest";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";

@Injectable()
export class UserWebCreator {

    constructor(
        private userWebRepository: UserWebRepository
    ) {}

    async create(request: UserWebCreatorRequest): Promise<any>{ 
        // Creamos el usuario en nuestra database y le asignamos la company
		const user = await this.userWebRepository.create(
			{
				id: request.getId(),
				favorites: JSON.stringify(request.getFavorites()),
				visited_tools: JSON.stringify(request.getVisitedTools()),
				// company
			}
		);

		await this.userWebRepository.insert(user);
		
    }

}