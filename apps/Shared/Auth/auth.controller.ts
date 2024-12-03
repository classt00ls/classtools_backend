import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Session, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";
import { GetAuthTokenQuery } from "src/Shared/Application/Query/User/GetAuthTokenQuery";
import { LoginUserDto } from "../User/login-user.dto";
import { LoginUserCommand } from "src/Shared/Application/Command/User/LoginUserCommand";
import { SignupUserCommand } from "src/Shared/Application/Command/User/SignupUserCommand";


@Controller('auth')
export class AuthController {

	constructor(
		private readonly commandBus:CommandBus,
		private readonly queryBus: QueryBus
	){}

	/** Verifica los datos del login y genera el auth token */
	@HttpCode(HttpStatus.OK)
	@Post('login')
	async loginUser(
		@Body() loginUserDto: LoginUserDto
	) {
		
		try {
			await this.commandBus.execute(
				new LoginUserCommand(
					loginUserDto.email,
					loginUserDto.password
				)
			);

			const acces_token = await this.queryBus.execute(
				new GetAuthTokenQuery(
					loginUserDto.email
				)
			) as { access_token: string };

			return acces_token;

		} catch (error) {
			throw error;
			if(error instanceof CannotLoginUserException) throw error;
			else throw new BadRequestException(ERROR_CODES.COMMON.USER.ERROR_LOGIN);
		}
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