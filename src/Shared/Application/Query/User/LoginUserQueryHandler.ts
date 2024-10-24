import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { scrypt  as _script} from "crypto";
import { promisify } from "util";
import { LoginUserQuery } from "./LoginUserQuery";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";

const scrypt = promisify(_script);

@QueryHandler(LoginUserQuery)
@Injectable()
export class LoginUserQueryHandler implements IQueryHandler<LoginUserQuery>{
    constructor(
        private userRepository: UserRepository
    ) {}

    async execute(query: LoginUserQuery) {
		
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
			return user;
		} else {
			throw CannotLoginUserException.becausePasswordIncorrect();
		}
    }
}