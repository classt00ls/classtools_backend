import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";
import { UserToolSuggestions } from "../../Model/UserToolSuggestions/UserToolSuggestions";



export abstract class UserToolSuggestionsRepository {
	abstract search(userId: UserId): Promise<UserToolSuggestions | null>;

	abstract save(): Promise<void>;

	abstract byVisitedTools(userId: UserId): Promise<UserToolSuggestions | null>;

	abstract byVisitedAndFavoriteTools(userId: UserId): Promise<UserToolSuggestions | null>;

	abstract byPrompt(prompt: string): Promise<any[]>;
}