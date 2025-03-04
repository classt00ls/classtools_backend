import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import puppeteer, { Browser } from "puppeteer-core";
import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";



@Injectable()
export class PuppeterScrapConnectionProvider extends ScrapConnectionProvider {

    browser;

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

    public async setBrowser() {

        this.browser = await puppeteer.connect({
            browserWSEndpoint: this.provider_key // this.configService.getOrThrow('SBR_WS_ENDPOINT')
        });

    }

    // En lugar de devolvernos el browser nos devuelve una página
    async getPage(url: string): Promise<Browser> {

        if(!this.browser) await this.setBrowser();
        
        let page = await this.browser.newPage();

        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        
        await Promise.all([
            page.waitForNavigation(),
            page.goto(url)
        ]);

        return page;
    }

    async closeBrowser() {

        await this.browser.close();
        this.browser = null;

    }
}