import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";
import { UserToolSuggestions } from "../../Model/UserToolSuggestions/UserToolSuggestions";



export abstract class UserToolSuggestionsRepository {
	abstract search(userId: UserId): Promise<UserToolSuggestions | null>;
}