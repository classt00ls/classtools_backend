import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ConfirmUserDto {
    @IsString()
	@IsNotEmpty()
	id: string;
}