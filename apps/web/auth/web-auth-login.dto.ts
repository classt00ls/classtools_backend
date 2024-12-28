import { IsEmail, IsString } from "class-validator";

export class WebAuthLoginDto {
    @IsEmail()
	email: string;

	@IsString()
	password: string;
}