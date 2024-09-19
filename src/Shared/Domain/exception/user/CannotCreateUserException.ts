import { BadRequestException } from "@nestjs/common";
import { ERROR_CODES } from "src/Domain/language/error.codes";

export class CannotCreateUserException extends BadRequestException {

    constructor(private newMessage) {
        super(newMessage);
    }

    public static becauseEmailIsAlreadyInUse() {
        return new this(ERROR_CODES.CREATE_USER_COMMAND.EMAIL_IN_USE);
    }

    public static becauseCompanyNameIsAlreadyInUse() {
        return new this(ERROR_CODES.CREATE_USER_COMMAND.COMPANY_IN_USE);
    }
}