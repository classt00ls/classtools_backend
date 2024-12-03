import { IsEmail, IsString } from "class-validator";

export class LoginUserCommand {
	
	constructor(
		public email: string,
		public password: string
	) { }
}