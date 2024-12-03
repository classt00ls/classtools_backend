import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Session, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";
import { CannotLoginUserException } from "src/Shared/Domain/Exception/user/CannotLoginUserException";
import { GetAuthTokenQuery } from "src/Shared/Application/Query/User/GetAuthTokenQuery";
import { LoginUserDto } from "../User/login-user.dto";
import { LoginUserCommand } from "src/Shared/Application/Command/User/LoginUserCommand";
import { SignupUserCommand } from "src/Shared/Application/Command/User/SignupUserCommand";
import { Serialize } from "src/web/Infrastructure/interceptors/serialize.interceptor";
import { AuthGuard } from "src/Shared/Infrastructure/guards/auth.guard";
import { UserMeDto } from "../User/user-me.dto";
import { UserWebRepository } from "src/web/Domain/Repository/UserWeb/UserWebRepository";


@Controller('auth')
export class AuthController {

	constructor(
		private readonly commandBus:CommandBus,
		private readonly queryBus: QueryBus,
		private userRepository: UserWebRepository
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

	@Get('/me')
	@UseGuards(AuthGuard)
	// @Serialize(UserMeDto)
	async me(
		@Request() req
	) {
		const userWeb = await this.userRepository.search(req.userId);
		return userWeb.toPrimitives();
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