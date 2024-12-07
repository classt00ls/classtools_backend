import { Injectable } from "@nestjs/common";


@Injectable()
export abstract class SuggestionsGenerator
{
    abstract generate(userText: string): any;
}