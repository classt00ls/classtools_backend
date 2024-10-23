import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";

export class CannotUpdateToolException extends UnauthorizedException {

    constructor(private newMessage) {
        super(newMessage);
    }

    public static becauseToolDontFound() {
        return new this(ERROR_CODES.UPDATE_TOOL.TOOL_NOT_FOUND);
    }

}