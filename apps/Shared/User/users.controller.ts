import { BadRequestException, Body, Controller, Get, Post, Session, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { CreateUserDto } from "src/Shared/Application/Dto/create-user.dto";
import { CannotCreateUserException } from "@Shared/Domain/Exception/user/CannotCreateUserException";
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";
import { Serialize } from "src/web/Infrastructure/interceptors/serialize.interceptor";
import { ConfirmUserDto } from "./confirm-user.dto";
import { AuthGuard } from "src/Shared/Infrastructure/guards/auth.guard";
import { CurrentUser } from "src/Shared/Infrastructure/decorators/user/current-user";
import { UserModel } from "src/Shared/Domain/Model/User/user.model";
import { UserMeDto } from "./user-me.dto";
import { GetCompleteUserQuery } from "src/Shared/Application/Query/User/GetCompleteUserQuery";
import { SignupUserCommand } from "src/Shared/Application/Command/User/SignupUserCommand";
import { ConfirmUserCommand } from "src/Shared/Application/Command/User/ConfirmUserCommand";


@Controller('user')
export class UsersController {

	constructor(
		private readonly commandBus:CommandBus,
		private readonly queryBus: QueryBus
	){}

	

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