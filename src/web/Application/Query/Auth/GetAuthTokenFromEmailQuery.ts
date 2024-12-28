import { IsEmail, IsString } from "class-validator";

export class GetAuthTokenFromEmailQuery {
	

	constructor(
		public email: string
	) { }
}