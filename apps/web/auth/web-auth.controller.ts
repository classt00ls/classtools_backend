import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Session, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from 		'@nestjs/cqrs';

import { ERROR_CODES } from 				"@Shared/Domain/language/error.codes";
import { CannotLoginUserException } from 	"@Shared/Domain/Exception/user/CannotLoginUserException";
import { GetAuthTokenFromEmailQuery } from 	"@Web/Application/Query/Auth/GetAuthTokenFromEmailQuery";
import { LoginUserCommand } from 			"@Shared/Application/Command/User/LoginUserCommand";
import { SignupUserCommand } from 			"@Shared/Application/Command/User/SignupUserCommand";
import { CreateUserDto } from 				"@Shared/Application/Dto/create-user.dto";
import { TokenAuthGuard } from				"@Web/Infrastructure/guard/token.auth.guard";
import { CannotCreateUserException } from 	"@Shared/Domain/Exception/user/CannotCreateUserException";

import { UserWebRepository } from 			"@Web/Domain/Repository/UserWeb/UserWebRepository";
import { UserWebId } from 					"@Web/UserWeb/Domain/UserWebId";

import { WebAuthLoginDto } from 			"@web/auth/web-auth-login.dto";

@Controller('')
export class WebAuthController {

	constructor(
		private readonly commandBus:CommandBus,
		private readonly queryBus: QueryBus,
		private userRepository: UserWebRepository
	){}

	/** Verifica los datos del login y genera el auth token */
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async loginUser(
		@Body() loginUserDto: WebAuthLoginDto
	) {
		
		try {
			await this.commandBus.execute(
				new LoginUserCommand(
					loginUserDto.email,
					loginUserDto.password
				)
			);

			// @TODO El token tiene que generarse con la id del usuario
			const acces_token = await this.queryBus.execute(
				new GetAuthTokenFromEmailQuery(
					loginUserDto.email
				)
			) as { access_token: string };

			return acces_token;

		} catch (error) {
			if(error instanceof CannotLoginUserException) throw error;
			else throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_LOGIN);
		}
	}

	@Get('me')
	@UseGuards(TokenAuthGuard)
	// @Serialize(UserMeDto)
	async me(
		@Request() req
	) {

		const userWeb = await this.userRepository.search(
			new UserWebId(req.userId)
		);
		return userWeb.toPrimitives();
	}

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
				throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_CREATING_USER);
			}
		}
		return {code: true};
	}


	@Post('signout') 
	async signoutUser(@Session() session: any){
		session.user = session.impersonated = null;
	}

	@Get('getRole')
	async getRole( )
	{
		return true;
	}
}