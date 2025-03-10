import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import puppeteer, { Browser, Page } from "puppeteer-core";
import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";



@Injectable()
export class PuppeterScrapConnectionProvider extends ScrapConnectionProvider {


    provider_key;

    constructor(
        private configService: ConfigService
    ) {
        
        super()
        this.provider_key = configService.getOrThrow('SBR_WS_ENDPOINT');
        
    }

    async getConnection(): Promise<Browser> {

        let browser ;

        browser = await puppeteer.connect({
            browserWSEndpoint: this.provider_key // this.configService.getOrThrow('SBR_WS_ENDPOINT')
        });

        return browser;
    }

    // En lugar de devolvernos el browser nos devuelve una página
    async getPage(url: string, browser: Browser): Promise<Page> {

        let page = await browser.newPage();

        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        
        await Promise.all([
            page.waitForNavigation(),
            page.goto(url)
        ]);

        return page;
    }
}