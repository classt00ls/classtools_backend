import { Injectable } from "@nestjs/common";
import { CommandBus, IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetCompleteUserQuery } from "./GetCompleteUserQuery";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";



@QueryHandler(GetCompleteUserQuery)
@Injectable()
export class GetCompleteUserQueryHandler implements IQueryHandler<GetCompleteUserQuery>{
    constructor(
        private userRepository: UserRepository
    ) {}

    async execute(query: GetCompleteUserQuery) {
		let user;
		user = await this.userRepository.getOneByIdOrFail(query.userId);


		return {nextplan: null, ...user};
  	}
}