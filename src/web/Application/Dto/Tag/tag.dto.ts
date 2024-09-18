import { Expose } from "class-transformer";

// Dto que se enviará al front de un lead
export class TagDto {
	constructor(data) {
	}

	// @Type(() => Date)
	@Expose()
	id: string

	@Expose()
	name: string

}