import { Page } from "puppeteer-core";

export class GetToolPricing {

    static async execute(page: Page): Promise<string> {
        const pricing_string = await page.$eval(
            'div.flex-wrap.gap-2:nth-child(5) > div', 
            price => price.innerText
        );

        return pricing_string ;
    }
}