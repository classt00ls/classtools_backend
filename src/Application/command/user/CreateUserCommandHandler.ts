import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { randomBytes, scrypt  as _script} from "crypto";
import { promisify } from "util";
import { CreateUserCommand } from "./CreateUserCommand";
import { RESPONSE_CODES } from "src/Domain/language/response.codes";
// import { MailService } from "src/Shared/Service/MailService";
import { CannotCreateUserException } from "src/Domain/exception/user/CannotCreateUserException";
import { UserRepository } from "src/Domain/Repository/user.repository";
import { CompanyRepository } from "src/Domain/Repository/company.repository";

const scrypt = promisify(_script);

@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler implements ICommandHandler<CreateUserCommand>{
    constructor(
        private userRepository: UserRepository,
		private companyRepository: CompanyRepository,
		// private emailService: MailService
    ) {}
	
	/**
	 * 
	 * @param command 
	 * @returns 
	 * @throws {CannotCreateUserException} code 3001 if email already in use
	 * @throws {CannotCreateUserException} code: 3002 if company name is in use
	 */
    async execute(command: CreateUserCommand) {

		console.log('Executing createusercommand ... ')

		try {
			await this.userRepository.findOneByEmailAndFail(command.email);
		} catch (error) {
			throw CannotCreateUserException.becauseEmailIsAlreadyInUse();
		}
        
		try {
			await this.companyRepository.findOneByNameAndFail(command.companyName);
		} catch (error) {
			// TODO: añadir usuario a compañia ya existente ?
			throw CannotCreateUserException.becauseCompanyNameIsAlreadyInUse();
		}
		
		// Generamos el hash de la contraseña
        const salt = randomBytes(8).toString('hex');
		const hash = await scrypt(command.password, salt, 32) as Buffer;
		const encodedPassword = salt+"."+hash.toString('hex');

        // Creamos la nueva compañia asociada al usuario
		const company = await this.companyRepository.create(
			{
				name: command.companyName
			}
		);
		
		// Creamos la compañia en nuestra database
		await this.companyRepository.insert(company);
		
		// Creamos el usuario en nuestra database y le asignamos la company
		const user = await this.userRepository.create(
			{
				email: command.email,
				password: encodedPassword,
				name: command.name,
				company
			}
		);

		await this.userRepository.insert(user);

		try {
			// await this.emailService.confirmation(command.email, user.id);
		} catch (error) {
			
		}
		
		return RESPONSE_CODES.CREATE_USER_COMMAND.CREATE_OK;
    }
}