import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UpgradeTagRequest {
    
    @IsString()
	@IsNotEmpty()
	@ApiProperty({
		description: 'The id of the tag to upgrade to category',
		required: true
	})
	id: string;

}