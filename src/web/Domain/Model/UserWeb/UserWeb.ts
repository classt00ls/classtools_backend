import { UserWebId } from "../../ValueObject/UserWebId";
import { AggregateRoot } from "src/Shared/Domain/Model/aggregateRoot";

export type UserWebPrimitives = {
	id: string;
	visitedTools: string[];
	favorites: string[];
	email: string,
	name: string
}

export class UserWeb extends AggregateRoot{

    private constructor(
		public readonly id: UserWebId,
        // TODO: darle estructura json. {toolname: nº clicks}
		public readonly visitedTools: string[],
		public favorites: string[],
		public email: string,
		public name: string
    ){
		super();
	}

    static fromPrimitives(primitives: UserWebPrimitives): UserWeb {
		return new UserWeb(
			new UserWebId(primitives.id),
			primitives.visitedTools,
			primitives.favorites,
			primitives.email,
			primitives.name
		);
	}

	static create(
		userId: string,
		email: string,
		name: string
	): UserWeb {
		return new UserWeb(
            new UserWebId(userId),
            [], 
            [],
			email,
			name
        );
	}

	addvisitedTool(visitedTool: string): void {
		this.visitedTools.push(visitedTool);
	}

	toPrimitives(): UserWebPrimitives {
		return {
			id: this.id.value,
			visitedTools: this.visitedTools,
			favorites: this.favorites,
			email: this.email,
			name: this.name
		};
	}
}