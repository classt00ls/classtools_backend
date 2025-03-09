import { QueryHandler, IQueryHandler } from "@nestjs/cqrs";
import { SearchCategoriesQuery } from "./SearchCategoriesQuery";
import { CategorySearcher } from "./CategorySearcher";
import { Category } from "../../Domain/Category";

@QueryHandler(SearchCategoriesQuery)
export class SearchCategoriesQueryHandler implements IQueryHandler<SearchCategoriesQuery> {
    constructor(
        private searcher: CategorySearcher
    ) {}

    async execute(): Promise<Category[]> {
        return this.searcher.search();
    }
} 