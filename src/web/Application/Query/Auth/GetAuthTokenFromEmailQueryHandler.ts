import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";

import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { GetAuthTokenFromEmailQuery } from "@Web/Application/Query/Auth/GetAuthTokenFromEmailQuery";

@Injectable()
@QueryHandler(GetAuthTokenFromEmailQuery)
export class GetAuthTokenFromEmailQueryHandler implements IQueryHandler<GetAuthTokenFromEmailQuery>{
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService
    ) {}

    async execute(query: GetAuthTokenFromEmailQuery): Promise<{ access_token: string }>  {
        const user = await this.userRepository.findOneByEmail(query.email);
		if(!user) {
			throw new Error('No se pudo obtener el token de autenticación');
		}
        const payload = { sub: user.id, useremail: user.email };

        return {
          access_token: await this.jwtService.signAsync(payload),
        };

  	}
}