import { AggregateRoot } from "@nestjs/cqrs";

export class Category extends AggregateRoot {
    private constructor(
        public readonly id: string,
        public name: string,
        public tools_num: number = 0
    ) {
        super();
    }

    imageUrl: string;

    setImageUrl(imageUrl: string) {
        this.imageUrl = imageUrl;
    }

    /**
     * Incrementa el contador de herramientas asociadas a esta categoría
     */
    incrementToolsNum(): void {
        this.tools_num += 1;
    }

    /**
     * Decrementa el contador de herramientas asociadas a esta categoría
     */
    decrementToolsNum(): void {
        if (this.tools_num > 0) {
            this.tools_num -= 1;
        }
    }

    /**
     * Establece un valor específico para el contador de herramientas
     */
    setToolsNum(count: number): void {
        if (count >= 0) {
            this.tools_num = count;
        }
    }

    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            imageUrl: this.imageUrl,
            tools_num: this.tools_num
        };
    }

    static fromPrimitives(
        id: string,
        name: string,
        tools_num: number = 0
    ) {
        return new Category(
            id,
            name,
            tools_num
        )
    }
} 