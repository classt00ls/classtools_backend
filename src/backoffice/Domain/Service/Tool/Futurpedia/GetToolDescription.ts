import { Page } from "puppeteer-core";

export class GetToolDescription {

    static async execute(page: Page): Promise<string> {
        const description = await page.$eval('div.prose-slate  .my-2:nth-child(2)', el => { return el.innerHTML });
        
        return description;
    }
}