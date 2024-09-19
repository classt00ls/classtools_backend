import { isNotEmpty, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Optional } from "@nestjs/common";

export class UpdateTagRequest {

	@IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'The id of the tag to upgrade to category',
		required: true
	})
	id: string;
    
    @IsString()
	@Optional()
	@ApiProperty({
		description: 'The id of the tag to upgrade to category',
		required: false
	})
	name: string;

	@IsString()
	@Optional()
	@ApiProperty({
		description: 'The route to image',
		required: false
	})
	imageUrl: string;

	@IsString()
	@Optional()
	@ApiProperty({
		description: 'The id of the tag to upgrade to category',
		required: false
	})
	excerpt: string;

}