import { IsEmail, IsString } from "class-validator";

export class GetCompleteUserQuery {
	

	constructor(
		public userId: string
	) { }
}