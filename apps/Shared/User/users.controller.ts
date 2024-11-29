import { BadRequestException, Body, Controller, Get, Post, Session, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateUserDto } from "src/Shared/Application/Dto/create-user.dto";
import { UserResponseDto } from "src/Shared/Application/Dto/user-response.dto";

import { CannotCreateUserException } from "src/Shared/Domain/Exception/user/CannotCreateUserException";
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";
import { Serialize } from "src/web/Infrastructure/interceptors/serialize.interceptor";
import { LoginUserDto } from "./login-user.dto";
import { LoginUserQuery } from "src/Shared/Application/Query/User/LoginUserQuery";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";
import { ConfirmUserDto } from "./confirm-user.dto";
import { ConfirmUserCommand } from "src/Shared/Application/Command/ConfirmUserCommand";
import { AuthGuard } from "src/Shared/Infrastructure/guards/auth.guard";
import { CurrentUser } from "src/Shared/Infrastructure/decorators/user/current-user";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";
import { UserMeDto } from "./user-me.dto";
import { GetCompleteUserQuery } from "src/Shared/Application/Query/User/GetCompleteUserQuery";
import { SignupUserCommand } from "src/Shared/Application/Command/SignupUserCommand";


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
	) {

		let commandResponse;
		try{
			commandResponse = await this.commandBus.execute(
				new SignupUserCommand(
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

	@Serialize(UserResponseDto)
	@Post('/auth/signin')
	async loginUser(
		@Body() loginUserDto: LoginUserDto,
		@Session() session: any,
	) {

// console.log('session', session); 
		
		try {
			const user = await this.queryBus.execute(
				new LoginUserQuery(
					loginUserDto.email,
					loginUserDto.password
				)
			) as UserModel;
			session.user = user.id;
			session.impersonated = user;
			return user;
		} catch (error) {
			throw error;
			if(error instanceof CannotLoginUserException) throw error;
			else throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_LOGIN);
		}
	}

	@Post('/auth/confirm')
	@UseGuards(AuthGuard) 
	async confirmUser( 
		@Body() confirmUserDto: ConfirmUserDto
	) {
		try{
			const commandResponse = await this.commandBus.execute(
				new ConfirmUserCommand(
					confirmUserDto.id
				)
			);
			return {code: commandResponse};
		} catch(error){
			if(error instanceof CannotCreateUserException) throw error;
			else throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_CREATING_USER);
		}
	}

	@Get('/auth/me')
	@UseGuards(AuthGuard)
	@Serialize(UserMeDto)
	async whoAmI(
		@Session() session: any, 
		@CurrentUser() user: UserModel
	) {
		const userCompanyAndPlan = await this.queryBus.execute(
			new GetCompleteUserQuery(
				user.id
			)
		);

		//const permissions = await this.queryBus.execute( new GetPermissionsQuery( user ));

		userCompanyAndPlan.impersonating = (session.user.id !== session.impersonated.id);
		//userCompanyAndPlan.permissions = permissions;
		
		return userCompanyAndPlan;
	}


	@Post('/auth/signout') 
	async signoutUser(@Session() session: any){
		session.user = session.impersonated = null;
	}

	@Get('/auth/getRole')
	async getRole( )
	{
		return true;
	}

	
}