import { Page } from "puppeteer-core";

export class GetToolStars {

    static async execute(page: Page): Promise<number> {
        const stars_string = await page.$$eval('div.flex.flex-wrap.gap-2 > div', price => price[2].innerText);


        const stars = stars_string.substring(
            6, 
            7
        );

        return parseInt(stars) ;
    }
}