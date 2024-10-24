import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConfirmUserCommand } from "./ConfirmUserCommand";
import { RESPONSE_CODES } from "src/Shared/Domain/language/response.codes";
import { CannotCreateUserException } from "src/Shared/Domain/Exception/user/CannotCreateUserException";
import { UserRepository } from "src/Shared/Domain/Repository/user.repository";

@Injectable()
@CommandHandler(ConfirmUserCommand)
export class ConfirmUserCommandHandler implements ICommandHandler<ConfirmUserCommand>{
    constructor(
        private userRepository: UserRepository,
		//private emailService: MailService
    ) {}
	
	
    async execute(command: ConfirmUserCommand) {

		console.log('Executing ConfirmUserCommand ... ')

        const existingUser = await this.userRepository.getOneByIdOrFail(
			command.userId
		)
        
		if(!existingUser) {
			throw CannotCreateUserException.becauseEmailIsAlreadyInUse();
		}
		if(existingUser.confirmed) {
			throw CannotCreateUserException.becauseEmailIsAlreadyInUse();
		}	
		
		existingUser.confirmed = true;
		
		// Al guardar el ususario se guarda en cascada la company
		await this.userRepository.save(existingUser);
		try {
			//await this.emailService.wellcome(existingUser.email);
		} catch (error) {
			console.log('See  email error ... ');
		}
		
		return RESPONSE_CODES.CREATE_USER_COMMAND.CONFIRMED_OK;
    }
}