import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserCreatorRequest } from "../Request/User/UserCreatorRequest";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class UserCreator {

    constructor(
        private userRepository: UserRepository
    ) {}

    async create(request: UserCreatorRequest): Promise<any>{ 
        // Creamos el usuario en nuestra database y le asignamos la company
		const user = await this.userRepository.create(
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