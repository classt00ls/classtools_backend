import { IsNotEmpty, IsString } from "class-validator";

export class LangChainDto {
    @IsString()
	@IsNotEmpty()
	prompt: string;
}