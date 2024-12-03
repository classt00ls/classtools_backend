import { IsEmail, IsString } from "class-validator";

export class GetAuthTokenQuery {
	

	constructor(
		public email: string
	) { }
}