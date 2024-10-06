import { Browser, Page } from "puppeteer-core";
import { PuppeterScrapConnectionProvider } from "src/Shared/Infrastructure/Service/Tool/PuppeterScrapConnectionProvider";

export class PuppeterScrapping {

    connection_provider: PuppeterScrapConnectionProvider;
    browser: Browser;

    constructor( ) {
        this.connection_provider = new PuppeterScrapConnectionProvider('wss://brd-customer-hl_4b0402b9-zone-scraping_browser4:3qzhznkob4x4@brd.superproxy.io:9222');
    }

    protected async getPage(url: string): Promise<Page> {
        this.browser = await this.connection_provider.getConnection() as Browser;

        let page = await this.browser.newPage();
        page.setDefaultNavigationTimeout(2 * 60 * 1000);
        
        await Promise.all([
            page.waitForNavigation(),
            page.goto(url)
        ]);

        return page;
    }

}