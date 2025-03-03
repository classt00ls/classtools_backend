import { Injectable } from "@nestjs/common";

@Injectable()
export class ScrapConnectionProvider{

    async getConnection(): Promise<any>{ }

    async getPage(url: string): Promise<any> { }

    async closeBrowser(): Promise<any> {}

}