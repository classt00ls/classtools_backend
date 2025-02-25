import { AggregateRoot } from "../../../Shared/Domain/Model/AggregateRoot";

export type ToolVectorPrimitives = {
	id: string;
	excerpt: string,
	name: string,
	description: string
}

export class ToolVector extends AggregateRoot{

    private constructor(
		public readonly id: string,
		public name: string,
		public description: string,
		public excerpt: string
    ){
		super();
	}

	static create(
		id: string,
		name: string,
		description: string,
        excerpt
	): ToolVector {
		const new_tool =  new ToolVector(
            id,
            name,
            description, 
            excerpt
        );

        // Lanzar evento created
        return new_tool;
    }

	toPrimitives(): ToolVectorPrimitives {
		return {
			id: this.id,
			name: this.name,
			excerpt: this.excerpt,
			description: this.description
		};
	}

	static fromPrimitives(primitives: ToolVectorPrimitives): ToolVector {
		return new ToolVector(
			primitives.id,
			primitives.name,
			primitives.description,
			primitives.excerpt
		);
	}
}