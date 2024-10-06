import { Page } from "puppeteer-core";

export class GetToolTitle {

    static async execute(page: Page): Promise<string> {
        return page.$eval('h1.text-2xl', h1 => h1.innerText);
    }
}