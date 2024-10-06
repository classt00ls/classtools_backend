import { Page } from "puppeteer-core";

export class GetToolTags {

    static  async execute(page: Page): Promise<string[]> {
        return page.$$eval('p.mt-2.text-ice-700 > a.capitalize', tags => {

            const allTags = tags.map((tag) => {
                return tag.innerText
            });

            return allTags;
        });
    }
}