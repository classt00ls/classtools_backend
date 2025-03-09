import { AggregateRoot } from "@nestjs/cqrs";
import { ToolModel } from "@Backoffice/Tool/Domain/tool.model";

export class Category extends AggregateRoot {
    private constructor(
        public readonly id: string,
        public name: string,
        public description: string,
        public excerpt: string,
        public deleted: boolean,
        public isCategory: number
    ) {
        super();
    }

    tools: ToolModel[];

    imageUrl: string;

    public upgrade() {
        this.isCategory = 1;
    }

    public downgrade() {
        this.isCategory = 0;
    }

    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            excerpt: this.excerpt,
            description: this.description,
            isCategory: this.isCategory
        }
    }

    static fromPrimitives(
        id: string,
        name: string,
        description: string,
        excerpt: string,
        deleted: boolean,
        isCategory: number
    ) {
        return new Category(
            id,
            name,
            description,
            excerpt,
            deleted,
            isCategory
        )
    }
} 