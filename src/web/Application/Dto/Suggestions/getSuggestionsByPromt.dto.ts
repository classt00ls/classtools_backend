import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export class getSuggestionsDto {

    @Expose()
    visitedTools: string;

    @Expose()
    suggestions: string;
}