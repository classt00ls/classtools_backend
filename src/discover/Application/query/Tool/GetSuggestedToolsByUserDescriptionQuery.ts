import { IsEmail, IsString } from "class-validator";

export class GetSuggestedToolsByUserDescriptionQuery {
	

	constructor(
		public userText: string
	) { }
}