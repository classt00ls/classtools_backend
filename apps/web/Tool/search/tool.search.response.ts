import { ToolResponse } from "@Web/Tool/Domain/tool.response";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export class ToolsSearchResponse {

    @Expose()
	@Type(() => ToolResponse)
    @ValidateNested()
	data: ToolResponse[];

    @Expose()
    count: number;
}