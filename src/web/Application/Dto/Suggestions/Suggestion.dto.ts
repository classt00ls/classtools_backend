import { Expose, Type } from "class-transformer";

export class suggestionDto {

    @Expose()
	userId: string;

    @Expose()
    visitedTools: string;

    @Expose()
    suggestions: string;
}