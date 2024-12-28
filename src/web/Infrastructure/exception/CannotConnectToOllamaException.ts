import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";

export class CannotConnectToOllamaException extends UnauthorizedException {

    constructor(private newMessage) {
        super(newMessage);
    }

    public static becauseNotFound() {
        return new this('Ollama not found');
    }

}