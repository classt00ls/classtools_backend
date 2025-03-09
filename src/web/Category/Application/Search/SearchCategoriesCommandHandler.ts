import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { SearchCategoriesCommand } from "./SearchCategoriesCommand";
import { CategorySearcher } from "./CategorySearcher";
import { Category } from "../../Domain/Category";

@CommandHandler(SearchCategoriesCommand)
export class SearchCategoriesCommandHandler implements ICommandHandler<SearchCategoriesCommand> {
    constructor(
        private searcher: CategorySearcher
    ) {}

    async execute(): Promise<Category[]> {
        return this.searcher.search();
    }
} 