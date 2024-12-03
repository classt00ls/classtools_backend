import { BaseModel } from "src/Shared/Domain/Model/base.model";
import { UserId } from "src/Shared/Domain/ValueObject/User/UserId";
import { UserToolSuggestionsGenerated } from "../../Event/UserToolSuggestions/UserToolSuggestionsGenerated";

export type UserToolSuggestionsPrimitives = {
	userId: string;
	visitedTools: string[];
	suggestions: string;
};

export class UserToolSuggestions extends BaseModel {

  constructor(
    public readonly userId: UserId,
		public visitedTools: string[],
		public suggestions: string
  ) {

    super();
  }

  static fromPrimitives(primitives: UserToolSuggestionsPrimitives): UserToolSuggestions {
        return new UserToolSuggestions(
            new UserId(primitives.userId),
            primitives.visitedTools,
            primitives.suggestions,
        );
    }

    static create(userId: string): UserToolSuggestions {
        return new UserToolSuggestions(
          new UserId(userId), [], "");
    }

    updateSuggestions(suggestions: string): void {
      this.suggestions = suggestions;
  
      this.record(new UserToolSuggestionsGenerated(this.userId.value, suggestions));
    }

    addVisitedTool(toolName: string): void {
      this.visitedTools.push(toolName);
    }
  
    toPrimitives(): UserToolSuggestionsPrimitives {
      return {
        userId: this.userId.value,
        visitedTools: this.visitedTools,
        suggestions: this.suggestions,
      };
    }
  
    hasCompleted(toolName: string): boolean {
      return this.visitedTools.includes(toolName);
    }
}