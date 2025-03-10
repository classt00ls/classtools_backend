import { Injectable } from "@nestjs/common";
@Injectable()
export class ScrapConnectionProvider{

    async getConnection(): Promise<any>{ }

    async getPage(url: string, browser: any): Promise<any> { }

}