import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ToolResponse } from "./tool.response";


export class getAllToolsDto {

    @Expose()
	@Type(() => ToolResponse)
    @ValidateNested()
	data: ToolResponse[];

    @Expose()
    count: number;
}