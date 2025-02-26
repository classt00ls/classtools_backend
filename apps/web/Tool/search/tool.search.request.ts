import { FilterDto } from "@Web/Tool/Domain/filterTools.dto";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

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