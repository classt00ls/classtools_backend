import { Expose, Type } from "class-transformer";

export class FilterToolsDto {

    @Expose()
    page: number;

    @Expose()
    pageSize: number;

    @Expose()
    tags: string[];

    @Expose()
    stars: number;
}