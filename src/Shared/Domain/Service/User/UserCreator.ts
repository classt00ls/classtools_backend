import { Injectable } from "@nestjs/common";

import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserCreatorRequest } from "src/Shared/Domain/Request/User/UserCreatorRequest";

@Injectable()
export class UserCreator {

    constructor(
        private userRepository: UserRepository
    ) {}

    async create(request: UserCreatorRequest): Promise<any>{  }

}