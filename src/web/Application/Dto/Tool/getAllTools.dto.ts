import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { ToolDashboardDto } from "./toolDashboard.dto";

export class getAllToolsDto {

    @Expose()
	@Type(() => ToolDashboardDto)
    @ValidateNested()
	data: ToolDashboardDto[];

    @Expose()
    count: number;
}