import { UserWebId } from "../../ValueObject/UserWebId";
import { AggregateRoot } from "src/Shared/Domain/Model/aggregateRoot";

export type UserWebPrimitives = {
	id: string;
	visitedTools: string[];
	favorites: string[];
}

export class UserWeb extends AggregateRoot{

    private constructor(
		public readonly id: UserWebId,
        // TODO: darle estructura json. {toolname: nº clicks}
		public readonly visitedTools: string[],
		public favorites: string[]
    ){
		super();
	}

    static fromPrimitives(primitives: UserWebPrimitives): UserWeb {
		return new UserWeb(
			new UserWebId(primitives.id),
			primitives.visitedTools,
			primitives.favorites,
		);
	}

	static create(userId: string): UserWeb {
		return new UserWeb(
            new UserWebId(userId),
            [], 
            []
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
		};
	}
}