import { BadRequestException } from "@nestjs/common";
import { ERROR_CODES } from "../../language/error.codes";

export class CannotLoginUserException extends BadRequestException {

    constructor(private newMessage) {
        super(newMessage);
    }

    public static becauseUserNotExist() {
        return new this(ERROR_CODES.LOGIN_USER_COMMAND.EMAIL_NOT_FOUND);
    }

    public static becauseUserNotConfirmed() {
        return new this(ERROR_CODES.LOGIN_USER_COMMAND.NOT_CONFIRMED);
    }

    public static becauseUserCancelled() {
        return new this(ERROR_CODES.COMMON.USER.CANCELLED);
    }

    public static becausePasswordIncorrect() {
        return new this(ERROR_CODES.LOGIN_USER_COMMAND.INCORRECT_PASSWORD);
    }
}