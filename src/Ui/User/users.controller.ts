import { BadRequestException, Body, Controller, Get, Post } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateUserDto } from "src/Shared/Domain/Dto/user/create-user.dto";
import { CreateUserCommand } from "src/Application/command/user/CreateUserCommand";
import { CannotCreateUserException } from "src/Shared/Domain/Exception/user/CannotCreateUserException";
import { ERROR_CODES } from "src/Domain/language/error.codes";

@Controller('user')
export class UsersController {

	constructor(
		private readonly commandBus:CommandBus,
		private readonly queryBus: QueryBus
	){}

	/**
	 * @description
	 * ---------------------------------------------------
	 * @param createUserDto 
	 * @throws {CannotCreateUserException} code 3001 if user with email was founded
	 * @throws {CannotCreateUserException} code 3002 if company with name was founded
	 * @throws {BadRequestException} code: 1 - if system error occurs
	 */
	@Post('signup')
	async createUser(
		@Body() createUserDto: CreateUserDto
	)
	{

		let commandResponse;
		try{
			commandResponse = await this.commandBus.execute(
				new CreateUserCommand(
					createUserDto.email,
					createUserDto.password,
					createUserDto.name,
					createUserDto.companyName
				)
			);
			
		} catch(error){
			if(error instanceof CannotCreateUserException) throw error;
			else {
				console.log('El error: ', error)
				throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_CREATING_USER);
			}
		}
		return {code: true};
	}

	@Get('/auth/getRole')
	async getRole( )
	{
		return true;
	}

	
}