import { Expose } from "class-transformer";

export class getAllCategoriesDto { 

    @Expose()
	imageUrl: string;

    @Expose()
    name: string;
    
}