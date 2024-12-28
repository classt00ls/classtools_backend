import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";


export class AuthMeDto {
	@Expose()
	id: number;

	@Expose()
	email: string;

	@Expose()
	name: string;

	@Expose()
	role: string;

	@Expose()
	impersonating: boolean;

}