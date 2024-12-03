import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler, IQueryHandler } from "@nestjs/cqrs";
import { scrypt  as _script} from "crypto";
import { promisify } from "util";

import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";
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

    async execute(query: LoginUserCommand): Promise<{ access_token: string }> {
		
        const user = await this.userRepository.findOneByEmail(query.email);
		if(!user) {
			throw CannotLoginUserException.becauseUserNotExist();
		}

		if(!user.confirmed && user.role != 'admin') {
			throw CannotLoginUserException.becauseUserNotConfirmed();
		}
		
		if(user.deleted) {
			throw CannotLoginUserException.becauseUserCancelled();
		}

		const [salt, storedHash] = user.password.split('.');

		const hash = await scrypt(query.password, salt, 32) as Buffer;

		if(storedHash === hash.toString('hex')) {
			const payload = { sub: user.id, useremail: user.email };
			return {
				access_token: await this.jwtService.signAsync(payload),
			};
		} else {
			throw CannotLoginUserException.becausePasswordIncorrect();
		}
    }
}