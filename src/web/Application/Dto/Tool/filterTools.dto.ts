import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export class FilterDto {

    @Expose()
    selectedCategories: string[];

    @Expose()
    stars: number;
}

class ToolDto {
    constructor(data) {
	}

    @Expose()
    page: number;

    @Expose()
    pageSize: number;

    @Expose()
    @Type(() => FilterDto)
    @ValidateNested()
    filters: FilterDto
}
export class FilterToolsDto {

    @Expose()
    @Type(() => ToolDto)
    @ValidateNested()
    params: ToolDto;
}

