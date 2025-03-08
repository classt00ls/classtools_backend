import { Expose, Transform } from "class-transformer";
import { IsArray, IsOptional, IsString } from "class-validator";

export class FilterDto {

    @Expose()
    @IsString()
    @IsOptional()
    @Transform(({ value }) => (value === 'undefined' || value === undefined ? undefined : String(value).trim())) // Evita "undefined"
    prompt: string;

    @IsArray()
    @IsString({ each: true }) // Valida que cada elemento del array sea un string
    @IsOptional()
    @Transform(({ value }) => (Array.isArray(value) ? value : value.split(','))) // Convierte "cat1,cat2" en ["cat1", "cat2"]
    selectedCategories?: string[];

    @Expose()
    @IsOptional()
    stars: number;

    @Expose()
    @IsOptional()
    title: string;

    @Expose()
    @IsString()
    @IsOptional()
    @Transform(({ value }) => (value === 'undefined' || value === undefined ? undefined : String(value).trim()))
    lang?: string;
}