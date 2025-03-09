import { AggregateRoot } from "@nestjs/cqrs";

export class Category extends AggregateRoot {
    private constructor(
        public readonly id: string,
        public name: string
    ) {
        super();
    }

    imageUrl: string;

    setImageUrl(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl
        };
    }

    static fromPrimitives(
        id: string,
        name: string
    ) {
        return new Category(
            id,
            name
        )
    }
} 