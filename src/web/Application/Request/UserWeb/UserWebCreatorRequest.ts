import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserWebCreatorRequest {
    public constructor(
        private id: string,
        private visitedTools: string[],
        private favorites: string[]
    ) { }

    public getId() {
        return this.id;
    }

    public getVisitedTools() {
        return this.visitedTools;
    }

    public getFavorites() {
        return this.favorites;
    }
}