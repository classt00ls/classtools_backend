import { Injectable } from "@nestjs/common";
import { ToolModel } from "@backoffice/Tool/Domain/tool.model";
import { ToolVector } from "@Web/Tool/Domain/tool.vector";
import { ToolVectorRepository } from "@Web/Tool/Domain/tool.vector.repository";


@Injectable()
export class ToolVectorCreator {
	constructor(
		private readonly toolVectorRepository: ToolVectorRepository
	) {}

	async create(tool: ToolModel): Promise<ToolVector> {

		const tool_vector = ToolVector.fromPrimitives(
            {
                id: tool.id,
                excerpt: tool.excerpt,
                name: tool.name,
                description: tool.description
            }
        );

        this.toolVectorRepository.save(tool_vector);

        return tool_vector;
	}
}