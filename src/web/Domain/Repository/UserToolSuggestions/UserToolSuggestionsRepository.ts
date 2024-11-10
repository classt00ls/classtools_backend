import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";
import { UserToolSuggestions } from "../../Model/UserToolSuggestions.ts/UserToolSuggestions";



export interface UserToolSuggestionsRepository {
	search(userId: UserId): Promise<UserToolSuggestions | null>;
}