import { ToolResponse } from '@Web/Tool/Domain/tool.response';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ToolResponseTest {
    @Expose()
	@Type(() => ToolResponse)
    @ValidateNested()
	data: ToolResponse[];
}

export class ToolsSearchResponse {
  @Expose()
  @Type(() => ToolResponse)
  tools: ToolResponseTest[];
} 