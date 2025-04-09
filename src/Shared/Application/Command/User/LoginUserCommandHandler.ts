import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, IQueryHandler } from "@nestjs/cqrs";
import { scrypt  as _script} from "crypto";
import { promisify } from "util";

import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { LoginUserCommand } from "./LoginUserCommand";
import { JwtService } from "@nestjs/jwt";

const scrypt = promisify(_script);

@Injectable()
@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler implements ICommandHandler<LoginUserCommand>{
    constructor(
        private userRepository: UserRepository,
		private jwtService: JwtService
    ) {}

    async execute(query: LoginUserCommand): Promise<void> {
		
        const user = await this.userRepository.findOneByEmail(query.email);
		if(!user) {
			throw new Error('No se pudo iniciar sesión');
		}

		if(!user.confirmed && user.role != 'admin') {
			throw new Error('No se pudo iniciar sesión');
		}
		
		if(user.deleted) {
			throw new Error('No se pudo iniciar sesión');
		}

		const [salt, storedHash] = user.password.split('.');

		const hash = await scrypt(query.password, salt, 32) as Buffer;

		if(storedHash === hash.toString('hex')) {
			return;
		} else {
			throw new Error('No se pudo iniciar sesión');
		}
    }
}