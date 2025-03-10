import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { Browser, chromium } from "playwright";

export class PlaywrightScrapProvider extends ScrapConnectionProvider {


    async getConnection(): Promise<Browser> {

        return await chromium.launch({ headless: true });
    }

    async getPage(url: string, browser: Browser): Promise<any> {
        
        const page = await browser.newPage();
        await page.goto(url);
        return page;
    }


}