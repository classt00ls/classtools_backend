import { Injectable } from "@nestjs/common";
import { UserToolSuggestions } from "src/web/Domain/Model/UserToolSuggestions/UserToolSuggestions";
import { UserToolSuggestionsRepository } from "src/web/Domain/Repository/UserToolSuggestions/UserToolSuggestionsRepository";
import { UserWebId } from "@Web/UserWeb/Domain/UserWebId";


@Injectable()
export class UserToolSuggestionsGenerator {
	constructor(
		private readonly userToolSuggestionsRepository: UserToolSuggestionsRepository
	) {}

	async search(userId: string): Promise<UserToolSuggestions | null> {
		return await this.userToolSuggestionsRepository.byVisitedTools(new UserWebId(userId));
	}
}