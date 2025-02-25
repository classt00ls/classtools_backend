import { ScrapConnectionProvider } from "src/Shared/Domain/Service/Tool/ScrapConnectionProvider";
import { chromium } from "playwright";

export class PlaywrightScrapProvider {

    constructor() {
    }

    async getConnection(): Promise<any> {

        const browser = await chromium.launch({ headless: true });

        return browser;
    }
}