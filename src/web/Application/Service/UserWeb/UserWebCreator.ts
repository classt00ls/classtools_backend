import { Injectable } from "@nestjs/common";
import { UserWebCreatorRequest } from "../../Request/UserWeb/UserWebCreatorRequest";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWeb } from "src/web/Domain/Model/UserWeb/UserWeb";

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
		
		await this.userWebRepository.save(userWeb);

		console.log('Ja hem creat el userweb');
		
    }

}