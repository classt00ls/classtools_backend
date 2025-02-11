import { Expose, Transform } from "class-transformer";
import { IsArray, IsString } from "class-validator";

export class FilterDto {

    @Expose()
    @IsString()
    @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
    prompt: string;

    @IsArray()
    @IsString({ each: true }) // Valida que cada elemento del array sea un string
    @Transform(({ value }) => (Array.isArray(value) ? value : value.split(','))) // Convierte "cat1,cat2" en ["cat1", "cat2"]
    selectedCategories?: string[];

    @Expose()
    stars: number;

    @Expose()
    title: string;
}