import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@nestjs/typeorm";
import { scrypt  as _script} from "crypto";
import { CannotLoginUserException } from "src/Domain/exception/user/CannotLoginUserException";
import { promisify } from "util";
import { UserRepository } from "../../Infrastructure/Repository/UserRepository";
import { LoginUserQuery } from "./LoginUserQuery";

const scrypt = promisify(_script);

@QueryHandler(LoginUserQuery)
@Injectable()
export class LoginUserQueryHandler implements IQueryHandler<LoginUserQuery>{
    constructor(
        @InjectRepository(UserRepository) private userRepository: UserRepository
    ) {}

    async execute(query: LoginUserQuery) {
		
        const user = await this.userRepository.findOneByEmail(query.email);
		if(!user) {
			throw CannotLoginUserException.becauseUserNotExist();
		}
		if(!user.confirmed && user.role != 'admin') {
			throw CannotLoginUserException.becauseUserNotConfirmed();
		}
		
		if(user.cancelled || user.deleted) {
			throw CannotLoginUserException.becauseUserCancelled();
		}

		if(!user.active) {
			throw CannotLoginUserException.becauseUserInactive();
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