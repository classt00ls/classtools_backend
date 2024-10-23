import { IsEmail, IsString } from "class-validator";

export class LoginUserQuery {
	

	constructor(
		public email: string,
		public password: string
	) { }
}