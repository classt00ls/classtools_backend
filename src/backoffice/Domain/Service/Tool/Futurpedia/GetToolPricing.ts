import { Page } from "puppeteer-core";

export class GetToolPricing {

    static async execute(page: Page): Promise<string> {
        return page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText);
    }
}