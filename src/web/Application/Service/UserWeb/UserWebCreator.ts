import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
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
				email: request.getEmail(),
				password: request.getPassword(),
				name: request.getName(),
				// company
			}
		);

		await this.userRepository.insert(user);
		
    }

}