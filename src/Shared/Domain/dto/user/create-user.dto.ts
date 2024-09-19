import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @IsEmail()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Email of new user',
		required: true
	})
	email: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Password of new user',
		required: true
	})
	password: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Name of new user',
		required: true
	})
	name: string;

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'Company name of new user',
		required: true
	})
	companyName: string;
}