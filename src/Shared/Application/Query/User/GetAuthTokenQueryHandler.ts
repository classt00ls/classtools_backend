import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { GetAuthTokenQuery } from "./GetAuthTokenQuery";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";
import { JwtService } from "@nestjs/jwt";

@Injectable()
@QueryHandler(GetAuthTokenQuery)
export class GetAuthTokenQueryHandler implements IQueryHandler<GetAuthTokenQuery>{
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async execute(query: GetAuthTokenQuery): Promise<{ access_token: string }>  {
        const user = await this.userRepository.findOneByEmail(query.email);
		if(!user) {
			throw CannotLoginUserException.becauseUserNotExist();
		}
        const payload = { sub: user.id, useremail: user.email };

        return {
          access_token: await this.jwtService.signAsync(payload),
        };

  	}
}