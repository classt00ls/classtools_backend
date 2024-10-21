import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ToolDto } from "./tool.dto";

export class RequestGetToolDto {

    @Expose()
    @Type(() => ToolDto)
    @ValidateNested()
    params: ToolDto;
}