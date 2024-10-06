import { Page } from "puppeteer-core";

export class GetToolFeatures {

    static async execute(page: Page): Promise<string> {
        
        const features = await page.$$eval(
            'div.prose-slate ul:nth-child(5) li.pl-0',
            (features) => {return features.map(feature => {
                let text = feature.innerText;
                let title = text.split(':')[0];
                let content = text.split(':')[1];
                return "<p><strong>"+title+"</strong>: "+content+"</p>";
            });}
        );

        return features.join('');
    }
}