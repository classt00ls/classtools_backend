import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { randomBytes, scrypt  as _script} from "crypto";
import { promisify } from "util";
import { SignupUserCommand } from "./SignupUserCommand";

import { EventEmitter2, EventEmitterReadinessWatcher } from "@nestjs/event-emitter";

import { RESPONSE_CODES } from "src/Shared/Domain/language/response.codes";
// import { MailService } from "src/Shared/Service/MailService";
import { CannotCreateUserException } from "src/Shared/Domain/Exception/user/CannotCreateUserException";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";
import { UserCreatorRequest } from "../../Domain/Request/User/UserCreatorRequest";
import { InfrastructureException } from "src/Shared/Infrastructure/Exception/InfrastructureException";

import { UserCreator } from "src/Shared/Domain/Service/User/UserCreator";
import { DomainEvent } from "src/Shared/Domain/Event/DomainEvent";
const {v4} = require('uuid');

const scrypt = promisify(_script);

@Injectable()
@CommandHandler(SignupUserCommand)
export class SignupUserCommandHandler implements ICommandHandler<SignupUserCommand>{
    constructor(
        private userRepository: UserRepository,
		@Inject('UserCreator') private userCreator: UserCreator,
		private eventEmitter: EventEmitter2,
		private eventEmitterReadinessWatcher: EventEmitterReadinessWatcher
		// private emailService: MailService
    ) {}
	
	/**
	 * 
	 * @param command 
	 * @returns 
	 * @throws {CannotCreateUserException} code 3001 if email already in use
	 * @throws {CannotCreateUserException} code: 3002 if company name is in use
	 */
    async execute(command: SignupUserCommand) {

		

		try {
			await this.userRepository.findOneByEmailAndFail(command.email);
		} catch (error) {
			throw CannotCreateUserException.becauseEmailIsAlreadyInUse();
		}

		
        
		// Generamos el hash de la contraseña
        const salt = randomBytes(8).toString('hex');
		const hash = await scrypt(command.password, salt, 32) as Buffer;
		const encodedPassword = salt+"."+hash.toString('hex');
		
		try {
			const userId = v4();

			const nuevo_usuario = await this.userCreator.create(
				new UserCreatorRequest(
					command.email,
					encodedPassword,
					command.name,
					userId
				)
			)

			const events = nuevo_usuario.pullDomainEvents();

			await this.eventEmitterReadinessWatcher.waitUntilReady();

			// Publicamos los eventos de dominio desde el caso de uso
			await Promise.all(
				events.map(async (event: DomainEvent) => {
					console.log('Emiting Event: ' + event.eventName)
					await this.eventEmitter.emit(
						event.eventName,
						event.toPrimitives()
					);
				})
			);


		} catch (error) {
			if(error instanceof InfrastructureException) {
				throw CannotCreateUserException.becauseInfrastructureProblem();
			}
		}
		
		return RESPONSE_CODES.CREATE_USER_COMMAND.CREATE_OK;
    }
}