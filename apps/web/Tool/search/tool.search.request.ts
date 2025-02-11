import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { FilterDto } from "@Web/Application/Dto/Tool/filterTools.dto";

export class ToolSearchRequest {

    @Expose()
    @Type(() => FilterDto)
    @ValidateNested()
    filters: FilterDto

    @Expose() 
    page: number;

    @Expose()     
    pageSize: number;
}