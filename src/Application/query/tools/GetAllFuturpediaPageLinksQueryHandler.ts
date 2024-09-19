import { GetAllFuturpediaPageLinksQuery } from "./GetAllFuturpediaPageLinksQuery";
import { QueryHandler } from "@nestjs/cqrs";
import { Inject, Injectable } from "@nestjs/common";
import { GetFuturpediaPageLinks } from "src/backoffice/Infrastructure/Import/puppeter/Tool/Futurpedia/GetFuturpediaPageLinks";


@QueryHandler(GetAllFuturpediaPageLinksQuery)
@Injectable()
export class GetAllFuturpediaPageLinksQueryHandler {
    constructor(
        @Inject('GetFuturpediaPageLinksInterface') private readonly futurpediaPageLinks: GetFuturpediaPageLinks
    ) {}

    async execute(command: GetAllFuturpediaPageLinksQuery) {

        const links = await this.futurpediaPageLinks.execute(command.route);

        return links;
    }
}