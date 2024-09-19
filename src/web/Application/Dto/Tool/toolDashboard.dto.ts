import { Expose, Type } from "class-transformer";
import { TagDto } from "../Tag/tag.dto";
import { ValidateNested } from "class-validator";

// Dto que se enviará al front de un lead
export class ToolDashboardDto {
	constructor(data) {
	}

	// @Type(() => Date)
	@Expose()
	id: string

	@Expose()
	name: string

	@Expose()
	url: string;

	@Expose()
	background_image: string;

	@Expose()
	price: string

	@Expose()
	stars: string

	@Expose()
	excerpt: string

	@Expose()
	description: string

	@Expose()
	link: boolean

	@Expose()
	isBookmarked: boolean

	@Expose()
	totalBookmarked: boolean

	@Expose()
	category: number;

	@Expose()
	@Type(() => TagDto)
    @ValidateNested()
	tags: TagDto[];
}