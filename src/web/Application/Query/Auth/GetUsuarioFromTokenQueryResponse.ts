import { IsEmail, IsString } from "class-validator";

export class GetUsuarioFromTokenQueryResponse {
	

	constructor(
		public id: string,
		public email: string
	) { }
}