import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { chromium } from "playwright";

export class PlaywrightScrapProvider extends ScrapConnectionProvider {

    browser;

    async getConnection(): Promise<any> {

        return chromium.launch({ headless: true });
    }

    public async setBrowser() {

        this.browser = await chromium.launch({ headless: true });

    }

    async getPage(url: string): Promise<any> {
        
        if(!this.browser) await this.setBrowser();
        const page = await this.browser.newPage();
        await page.goto(url);
        return page;
    }

    async closeBrowser(): Promise<any> {
        await this.browser.close();
        this.browser = null;
    }

}