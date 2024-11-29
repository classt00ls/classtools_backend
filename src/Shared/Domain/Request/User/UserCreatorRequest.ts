import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UserCreatorRequest {
    public constructor(
        private email: string,
        private password: string,
        private name: string,
        private id: string
    ) { }

    public getEmail() {
        return this.email;
    }

    public getPassword() {
        return this.password;
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }
}