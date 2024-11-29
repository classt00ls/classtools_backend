import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserCreatorRequest } from "../../Domain/Request/User/UserCreatorRequest";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";

@Injectable()
export class UserCreator {

    constructor(
        private userRepository: UserRepository
    ) {}

    async create(request: UserCreatorRequest): Promise<UserModel>{ 
        // Creamos el usuario en nuestra database y le asignamos la company
		const user = UserModel.crear(
			request.getId(),
			request.getEmail(),
			request.getPassword(),
			request.getName()
		)

		await this.userRepository.insert(user);

		return user;
		
    }

}