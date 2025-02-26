import { Injectable } from "@nestjs/common";
import { UserWebCreatorRequest } from "./UserWebCreatorRequest";
import { UserWebRepository } from "@Web/UserWeb/Domain/UserWebRepository";
import { UserWeb } from "@Web/UserWeb/Domain/UserWeb";

@Injectable()
export class UserWebCreator {

    constructor(
        private userWebRepository: UserWebRepository
    ) {}

    async create(request: UserWebCreatorRequest): Promise<any>{ 
        // Creamos el usuario en nuestra database y le asignamos la company
		const userWeb = UserWeb.create(
			request.getId(),
			request.getEmail(),
			request.getName()

		) 
		console.log('userWeb: ', userWeb);
		await this.userWebRepository.save(userWeb);
		
    }

}