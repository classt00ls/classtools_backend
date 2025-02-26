import { QueryHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { ToggleFavoriteCommand } from "./ToggleFavoriteCommand";
import { ToogleFavorite } from "@Web/UserWeb/Domain/ToogleFavorite";
import { UserWebId } from "../Domain/UserWebId";


@QueryHandler(ToggleFavoriteCommand)
@Injectable()
export class ToggleFavoriteCommandHandler {
    constructor(
        private toggler: ToogleFavorite
    ) {}

    async execute(command: ToggleFavoriteCommand) {

        return await this.toggler.execute(
            new UserWebId(command.userId),
            command.toolId
         );
        
    }
}