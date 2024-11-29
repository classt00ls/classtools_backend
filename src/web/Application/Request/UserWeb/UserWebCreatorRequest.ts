import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserWebCreatorRequest {
    public constructor(
        private id: string,
        private email: string,
        private name: string,
        private visitedTools?: string[],
        private favorites?: string[]
    ) { }

    public getId() {
        return this.id;
    }

    public getEmail() {
        return this.email;
    }

    public getName() {
        return this.name;
    }

    public getVisitedTools() {
        return this.visitedTools;
    }

    public getFavorites() {
        return this.favorites;
    }
}