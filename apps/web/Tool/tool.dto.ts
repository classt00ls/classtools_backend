import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";


export class ToolDto {
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