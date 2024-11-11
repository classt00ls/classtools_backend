import { BadRequestException } from "@nestjs/common";

export class InfrastructureException extends BadRequestException {

    constructor(private newMessage) {
        super(newMessage);
    }
}