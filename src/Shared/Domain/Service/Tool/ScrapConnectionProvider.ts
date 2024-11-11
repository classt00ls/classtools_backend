import { Injectable } from "@nestjs/common";

@Injectable()
export class ScrapConnectionProvider{

    provider_key: string;

    constructor(provider_key) {
        this.provider_key = provider_key;
    }

    async getConnection(): Promise<any>{ }

}