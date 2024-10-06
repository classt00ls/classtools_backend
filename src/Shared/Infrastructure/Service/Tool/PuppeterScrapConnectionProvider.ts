import puppeteer, { Browser } from "puppeteer-core";
import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";




export class PuppeterScrapConnectionProvider extends ScrapConnectionProvider {

    constructor(provider_key: string) {
        super(provider_key)
    }

    async getConnection(): Promise<Browser> {
        let browser ;

        browser = await puppeteer.connect({
            browserWSEndpoint: this.provider_key // this.configService.getOrThrow('SBR_WS_ENDPOINT')
        });

        return browser;
    }
}