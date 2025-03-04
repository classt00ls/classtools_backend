import { ScrapToolResponse } from "./ScrapResponse";



export interface ScrapTool {

    scrap(link: string): ScrapToolResponse;
}