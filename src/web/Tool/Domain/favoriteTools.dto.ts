import { Expose, Type } from "class-transformer";
import { TagDto } from "@Web/Application/Dto/Tag/tag.dto";
import { ValidateNested } from "class-validator";

export class FavoriteToolsDto {
    constructor(data) {
        Object.assign(this, data);
    }

    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    url: string;

    @Expose()
    pricing: string;

    @Expose()
    stars: string;

    @Expose()
    excerpt: string;

    @Expose()
    link: boolean;

    @Expose()
    isBookmarked: boolean;

    @Expose()
    totalBookmarked: boolean;

    @Expose()
    category: number;

    @Expose()
    @Type(() => TagDto)
    @ValidateNested()
    tags: TagDto[];

    @Expose()
    video_url: string;

    @Expose()
    ratings: string;
} 