import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";
import { UserToolSuggestions } from "../../Model/UserToolSuggestions/UserToolSuggestions";



export abstract class UserToolSuggestionsRepository {
	abstract search(userId: UserId): Promise<UserToolSuggestions | null>;

	abstract byVisitedTools(userId: UserId): Promise<UserToolSuggestions | null>;

	abstract byVisitedAndFavoriteTools(userId: UserId): Promise<UserToolSuggestions | null>;
}