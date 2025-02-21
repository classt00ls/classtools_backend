import { GetAllFuturpediaPageLinksQuery } from "./GetAllFuturpediaPageLinksQuery";
import { QueryHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { GetFuturpediaPageLinksInterface } from "src/backoffice/Domain/Tool/Futurpedia/GetFuturpediaPageLinksInterface";


@QueryHandler(GetAllFuturpediaPageLinksQuery)
@Injectable()
export class GetAllFuturpediaPageLinksQueryHandler {
    constructor(
        @Inject('GetFuturpediaPageLinksInterface') private readonly futurpediaPageLinks: GetFuturpediaPageLinksInterface
    ) {}

    async execute(command: GetAllFuturpediaPageLinksQuery) {

        const links = await this.futurpediaPageLinks.execute(command.route);
        
        return links;
    }
}