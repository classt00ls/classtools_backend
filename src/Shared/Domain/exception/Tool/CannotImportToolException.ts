import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { ERROR_CODES } from "src/Shared/Domain/language/error.codes";

export class CannotImportToolException extends UnauthorizedException {

    constructor(private newMessage) {
        super(newMessage);
    }

    public static becauseCredentialsError() {
        return new this(ERROR_CODES.IMPORT_TOOL.CREDENTIALS_INVALID);
    }

}