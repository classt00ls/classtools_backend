import { AggregateRoot } from "../../../Shared/Domain/Model/AggregateRoot";
import { UserWebId } from "./UserWebId";

export type UserWebPrimitives = {
	id: string;
	suggestions: string;
	visitedTools: string;
	favorites: string;
	email: string,
	name: string
}

export class UserWeb extends AggregateRoot{

    private constructor(
		public readonly id: UserWebId,
		public visitedTools: string,
		public favorites: string,
		public email: string,
		public name: string,
		public suggestions: string
    ){
		super();
	}

    static fromPrimitives(primitives: UserWebPrimitives): UserWeb {
		return new UserWeb(
			new UserWebId(primitives.id),
			primitives.visitedTools,
			primitives.favorites,
			primitives.email,
			primitives.name,
			primitives.suggestions
		);
	}

	static create(
		id: string,
		email: string,
		name: string
	): UserWeb {
		return new UserWeb(
            new UserWebId(id),
            '[]', 
            '[]',
			email,
			name,
			''
        );
	}

	addvisitedTool(visitedTool: string): void {
		let tools = JSON.parse(this.visitedTools);
		const index = tools.findIndex(item => item['id'] == visitedTool);
		// si no la teniamos la añadimos
		if(index == -1) {
			const new_element = {
				id: visitedTool,
				visited: 1
			};
			tools.push(new_element);
			this.visitedTools = JSON.stringify(tools);
			return;
		}
		
		tools[index].visited = tools[index].visited + 1;
		this.visitedTools = JSON.stringify(tools);
	}

	toggleFavorite(favoriteTool: string): void {
		let favorites = [];
		
		if (this.favorites) {
			try {
				favorites = JSON.parse(this.favorites);
			} catch (error) {
				favorites = [];
			}
		}
		
		const index = favorites.indexOf(favoriteTool);
	
		if (index === -1) {
			favorites.push(favoriteTool);
		} else {
			favorites.splice(index, 1);
		}
	
		this.favorites = JSON.stringify(favorites);
	}

	setSuggestions(suggestions: string) {
		this.suggestions = suggestions;

	}

	toPrimitives(): UserWebPrimitives {
		return {
			id: this.id.value,
			visitedTools: this.visitedTools,
			favorites: this.favorites,
			email: this.email,
			name: this.name,
			suggestions: this.suggestions
		};
	}
}