
import { ToolVector } from "@Web/Tool/Domain/tool.vector";



export abstract class ToolVectorRepository {

	abstract search(query: string): Promise<ToolVector[]>;
}