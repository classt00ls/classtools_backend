import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

export class FilterDto {

    @Expose()
    selectedCategories: string[];

    @Expose()
    stars: number;

    @Expose()
    title: string;
}