import { Browser, Page } from "puppeteer-core";
import { PuppeterScrapConnectionProvider } from "@Shared/Infrastructure/Scrap/PuppeterScrapConnectionProvider";


export class PuppeterScrapping {

    connection_provider: PuppeterScrapConnectionProvider;
    browser: Browser;

    constructor( 
        
    ) {
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