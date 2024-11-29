import { IsEmail, IsString } from "class-validator";

/**
 * @returns Promise<UserModel>
 */
export class LoginUserQuery {
	

	constructor(
		public email: string,
		public password: string
	) { }
}