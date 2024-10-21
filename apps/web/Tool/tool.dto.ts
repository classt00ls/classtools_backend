import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { FilterDto } from "src/web/Application/Dto/Tool/filterTools.dto";


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